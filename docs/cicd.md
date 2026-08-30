# MealOK CI/CD procedure

## Workflow location and triggers

The workflow is [`.github/workflows/deploy-mealok.yml`](../.github/workflows/deploy-mealok.yml).
It runs on:

- Every push to `main`
- Every tag matching `v*`
- Manual dispatch from the GitHub Actions UI or CLI

The job runs on the Docker-VM self-hosted runner using these labels:

```yaml
self-hosted, linux, x64, docker-vm
```

Deployments use the `mealok-deploy` concurrency group with
`cancel-in-progress: false`, so two deployments do not overwrite one another.

## Pipeline stages

1. **Checkout** — checks out the exact commit that triggered the run.
2. **Validate configuration** — requires the Portainer key, auth secret, database password, and
   browser-visible URL; validates the port and rejects newline-containing values.
3. **Clean Docker build storage** — removes unused MealOK-labeled images and all unused Docker
   BuildKit cache. It does not remove volumes or running containers.
4. **Build and test** — builds `Dockerfile`, runs the configured Vitest checks inside the build,
   and runs the production Next.js build. The image is tagged with an immutable commit/tag name.
5. **Prepare stack environment** — creates a mode `0600` temporary env file with the database URL,
   auth settings, image tag, and migration flag.
6. **Back up the database** — creates a custom-format dump for an existing running database before
   updating the stack. First deployment skips this because no MealOK database exists yet.
7. **Deploy through Portainer** — creates the `mealok` stack on first deployment, then updates it
   on subsequent runs. The existing database volume is retained.
8. **Start and migrate** — the app waits for PostgreSQL, runs Drizzle migrations, then starts.
9. **Health check** — waits for the app container to become healthy and verifies `/login` on port
   `3010` by default.
10. **Cleanup** — removes the generated temporary environment file from the runner workspace.

## Required GitHub settings

Secrets:

| Name | Used as |
| --- | --- |
| `PORTAINER_API_KEY` | Portainer `X-API-Key` header |
| `MEALOK_AUTH_SECRET` | `AUTH_SECRET` and `NEXTAUTH_SECRET` |
| `MEALOK_POSTGRES_PASSWORD` | PostgreSQL password and generated connection string |

Required variable:

| Name | Example |
| --- | --- |
| `MEALOK_NEXTAUTH_URL` | `https://meals.arjunc.com` |

Optional variables and defaults are documented in [deployment.md](deployment.md). The current
Portainer URL variable is `https://192.168.1.14:9443`; TLS verification remains disabled unless
`PORTAINER_VERIFY_SSL=true` is deliberately configured with a trusted certificate.

## Development and release flow

Local checks before pushing:

```bash
npm ci
npm run build
npx vitest run tests/domain.test.ts tests/portions.test.ts
```

The production Docker build repeats the relevant build/tests in a clean image context. Database-
dependent tests require a PostgreSQL instance and are not part of the current image build gate.

For normal deployment, merge to `main`. For a named release, create and push a version tag:

```bash
git tag v0.1.1
git push origin v0.1.1
```

Use manual dispatch when deploying a selected commit/tag or retrying a failed run. Never put
secrets in workflow inputs, source files, image labels, or logs.

## Rollback

The workflow gives each build an immutable image tag. To roll back:

1. Identify the last known-good tag or commit.
2. Run the workflow manually against that ref, or use the Portainer stack to select the known-good
   image while preserving the database volume.
3. Confirm the app health check and inspect the database migration compatibility.
4. Restore the database only if the failed release made an incompatible data change; see
   [operations.md](operations.md).

Do not run `docker system prune --volumes`, remove `mealok_postgres_data`, or reset the database as
part of a rollback.

## Self-hosted runner notes

Docker-VM runs the MealOK runner as:

```text
actions.runner.itsarjunc-MealOK.abhiram-lab-docker-vm.service
WorkingDirectory=/home/abhiram/actions-runner-MealOK
User=abhiram
```

The runner is separate from Kuber’s runner. Keep separate runner directories, registration state,
work directories, and services.
