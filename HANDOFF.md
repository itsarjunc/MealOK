# MealOK maintainer handoff

This document is the starting point for anyone maintaining or deploying MealOK.

## Read in this order

1. [Architecture](docs/architecture.md) — what runs where and where data lives.
2. [CI/CD procedure](docs/cicd.md) — how a commit becomes a deployment.
3. [First-run and proxy setup](docs/first-run.md) — public URL, TLS, and the first account.
4. [Operations runbook](docs/operations.md) — health checks, backups, restores, and rollback.
5. [Deployment configuration](docs/deployment.md) — exact GitHub settings and defaults.

## Current topology

| Component | Location | Details |
| --- | --- | --- |
| Git repository | GitHub | `itsarjunc/MealOK`, default branch `main` |
| Build/deploy runner | Docker-VM | Runner label `docker-vm` |
| Runner service | Docker-VM | `actions.runner.itsarjunc-MealOK.abhiram-lab-docker-vm.service` |
| Portainer | Docker-VM | HTTPS on port `9443` |
| Application | Docker-VM | Port `3010`, Compose service `app` |
| Database | Docker-VM | PostgreSQL service `db`, internal port `5432` |
| Persistent data | Docker-VM | Docker volume `mealok_postgres_data` |

MealOK uses the Docker-VM runner directly. The `microservices-1` runner and Kuber deployment are
separate systems and should not be used as MealOK's deployment target.

## Normal change procedure

1. Work on a branch and run the local checks.
2. Review database migrations and runtime environment changes.
3. Open a pull request for review; do not add pull-request execution to the self-hosted workflow.
4. Merge to `main` when ready. A push to `main` automatically deploys.
5. Watch the Actions run through image build, backup, Portainer update, migrations, and health check.
6. Verify the application and database containers in Portainer or with the commands in
   [operations.md](docs/operations.md).

Version tags matching `v*` and manual workflow dispatch are also supported. The workflow uses a
concurrency group, so deployments are serialized.

## Important invariants

- Never share the MealOK PostgreSQL volume with Kuber.
- Never run `scripts/seed.ts` against production; it is destructive development data.
- Do not publish PostgreSQL port `5432` to the LAN.
- Keep the Portainer API key and application/database secrets in GitHub Actions settings only.
- Do not remove `mealok_postgres_data` during cleanup or rollback.
- Any push to `main`, including documentation-only changes, triggers a deployment.
