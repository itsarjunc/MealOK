#!/usr/bin/env python3
"""Create or update a Portainer standalone stack without logging credentials."""

from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


class PortainerError(RuntimeError):
    pass


def parse_args() -> dict[str, str]:
    import argparse

    parser = argparse.ArgumentParser(
        description="Create or update a Portainer standalone stack from a Compose file."
    )
    parser.add_argument("--stack-name", required=True)
    parser.add_argument("--stack-file", required=True)
    parser.add_argument("--env-file", required=True)
    parser.add_argument("--endpoint-id", type=int)
    args = parser.parse_args()
    return vars(args)


def read_env_file(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise PortainerError(f"Stack environment file not found: {path}")

    values: list[dict[str, str]] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        if "=" not in raw_line:
            raise PortainerError(f"Invalid stack environment line in {path}")
        name, value = raw_line.split("=", 1)
        values.append({"name": name.strip(), "value": value})
    return values


class PortainerClient:
    def __init__(self, url: str, api_key: str, verify_ssl: bool) -> None:
        self.url = url.rstrip("/")
        self.context = (
            ssl.create_default_context()
            if verify_ssl
            else ssl._create_unverified_context()
        )
        self.headers = {"X-API-Key": api_key}

    def request(
        self,
        method: str,
        path: str,
        payload: dict | list | None = None,
    ) -> object:
        data = None
        headers = dict(self.headers)
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")

        request = urllib.request.Request(
            f"{self.url}{path}",
            data=data,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, context=self.context) as response:
                body = response.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            # Do not include the response body: Portainer errors could echo stack data.
            raise PortainerError(f"Portainer request failed with HTTP {error.code}") from error
        except urllib.error.URLError as error:
            raise PortainerError(f"Could not reach Portainer: {error.reason}") from error

        if not body:
            return None
        try:
            return json.loads(body)
        except json.JSONDecodeError as error:
            raise PortainerError("Portainer returned an invalid JSON response") from error


def endpoint_id(client: PortainerClient, requested: int | None) -> int:
    if requested is not None:
        return requested

    result = client.request("GET", "/api/endpoints")
    if not isinstance(result, list) or not result:
        raise PortainerError("No Portainer endpoints are available")
    if len(result) == 1:
        return int(result[0]["Id"])

    local = [item for item in result if item.get("Name") == "local"]
    if len(local) == 1:
        return int(local[0]["Id"])
    raise PortainerError("Multiple Portainer endpoints found; set PORTAINER_ENDPOINT_ID")


def find_stack(client: PortainerClient, name: str, endpoint: int) -> dict | None:
    result = client.request("GET", "/api/stacks")
    if not isinstance(result, list):
        raise PortainerError("Portainer returned an invalid stack list")
    for stack in result:
        if stack.get("Name") == name and int(stack.get("EndpointId", -1)) == endpoint:
            return stack
    return None


def main() -> int:
    args = parse_args()
    url = os.environ.get("PORTAINER_URL", "https://127.0.0.1:9443")
    api_key = os.environ.get("PORTAINER_API_KEY", "")
    if not api_key:
        raise PortainerError("PORTAINER_API_KEY is required")

    verify_ssl = os.environ.get("PORTAINER_VERIFY_SSL", "false").lower() in {
        "1",
        "true",
        "yes",
    }
    client = PortainerClient(url, api_key, verify_ssl)
    selected_endpoint = endpoint_id(client, args.get("endpoint_id"))
    stack_name = args["stack_name"]
    compose_content = Path(args["stack_file"]).read_text(encoding="utf-8")
    stack_env = read_env_file(Path(args["env_file"]))
    existing = find_stack(client, stack_name, selected_endpoint)

    if existing is None:
        result = client.request(
            "POST",
            "/api/stacks/create/standalone/string?"
            + urllib.parse.urlencode({"endpointId": selected_endpoint}),
            {
                "name": stack_name,
                "stackFileContent": compose_content,
                "env": stack_env,
                "fromAppTemplate": False,
            },
        )
        if not isinstance(result, dict) or "Id" not in result:
            raise PortainerError("Portainer did not return the new stack ID")
        print(f"Created Portainer stack '{stack_name}' (id={result['Id']}).")
        return 0

    stack_id = int(existing["Id"])
    client.request(
        "PUT",
        f"/api/stacks/{stack_id}?"
        + urllib.parse.urlencode({"endpointId": selected_endpoint}),
        {
            "id": stack_id,
            "stackFileContent": compose_content,
            "env": stack_env,
            "prune": True,
            "pullImage": False,
        },
    )
    print(f"Updated Portainer stack '{stack_name}' (id={stack_id}).")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PortainerError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
