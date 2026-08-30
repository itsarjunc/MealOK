# MealOK deployment

MealOK deploys to the Docker-VM Portainer environment from `.github/workflows/deploy-mealok.yml`.
The workflow runs only for `v*` tags or a manual dispatch. It targets the self-hosted runner
label `docker-vm`, builds the image locally with Docker, and creates or updates the standalone
Portainer stack named `mealok`.

## GitHub configuration

Add these repository secrets:

| Secret | Purpose |
| --- | --- |
| `PORTAINER_API_KEY` | Portainer access token for the Docker-VM endpoint and stack management |
| `MEALOK_AUTH_SECRET` | Long random secret used by NextAuth (`AUTH_SECRET` and `NEXTAUTH_SECRET`) |
| `MEALOK_POSTGRES_PASSWORD` | Password for the persistent MealOK PostgreSQL database |

Add this required repository variable:

| Variable | Purpose |
| --- | --- |
| `MEALOK_NEXTAUTH_URL` | The exact browser-visible base URL, including the port if applicable |

Optional variables and defaults:

| Variable | Default |
| --- | --- |
| `MEALOK_STACK_NAME` | `mealok` |
| `MEALOK_APP_PORT` | `3010` |
| `MEALOK_POSTGRES_DB` | `mealok` |
| `MEALOK_POSTGRES_USER` | `mealok` |
| `PORTAINER_URL` | `https://127.0.0.1:9443` |
| `PORTAINER_VERIFY_SSL` | `false` (use `true` with a trusted Portainer certificate) |
| `PORTAINER_ENDPOINT_ID` | autodetected when Docker-VM has one Portainer endpoint |

Generate the two application/database secrets locally, then paste them into GitHub without
printing them into workflow logs. The database password is URL-encoded when the app connection
string is generated, so punctuation is supported.

## One-time Portainer setup

1. Create a Portainer API access token for the account that can manage stacks on Docker-VM's
   local endpoint, and save it as `PORTAINER_API_KEY`.
2. Ensure the `abhiram` account used by the MealOK runner can run Docker commands.
3. Ensure host port `3010` is free, or set `MEALOK_APP_PORT` to an available port.
4. No stack needs to be created manually. The first workflow run creates `mealok`; later runs
   update it while retaining its `postgres_data` volume.

The app waits for PostgreSQL, runs checked-in Drizzle migrations automatically, and then starts
only after its container health check passes. The workflow takes a custom-format PostgreSQL dump
before updating an existing stack, storing it under `/var/tmp/mealok-backups` on Docker-VM and
retaining backups for 14 days. `scripts/seed.ts` is development data-reset code and is never run
by deployment.

To deploy a release, push a version tag such as `v0.1.0`. A manual dispatch uses an immutable
commit-based image tag and follows the same backup, migration, and health-check path.
