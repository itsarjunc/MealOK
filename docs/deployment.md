# MealOK deployment configuration

MealOK is deployed as a Docker Compose stack managed by Portainer on Docker-VM. The source of
truth is the repository workflow and production Compose file:

- `.github/workflows/deploy-mealok.yml`
- `docker-compose.production.yml`
- `Dockerfile`

For the complete handoff, see [HANDOFF.md](../HANDOFF.md), [cicd.md](cicd.md),
[first-run.md](first-run.md), and [operations.md](operations.md).

## Repository configuration

Add these repository secrets under **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Purpose |
| --- | --- |
| `PORTAINER_API_KEY` | Portainer API access for managing the `mealok` stack |
| `MEALOK_AUTH_SECRET` | Long random secret used by NextAuth |
| `MEALOK_POSTGRES_PASSWORD` | Password for the persistent MealOK PostgreSQL database |

Add these repository variables under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Required | Default/purpose |
| --- | --- | --- |
| `MEALOK_NEXTAUTH_URL` | Yes | Exact browser-visible URL, such as `https://means.arjunc.com` |
| `PORTAINER_URL` | No | `https://127.0.0.1:9443`; the current setup uses the Docker-VM address |
| `MEALOK_APP_PORT` | No | `3010` |
| `MEALOK_STACK_NAME` | No | `mealok` |
| `MEALOK_POSTGRES_DB` | No | `mealok` |
| `MEALOK_POSTGRES_USER` | No | `mealok` |
| `PORTAINER_VERIFY_SSL` | No | `false` for the current Portainer certificate setup |
| `PORTAINER_ENDPOINT_ID` | No | Autodetected when Docker-VM has one Portainer endpoint |

Generate the two MealOK secrets locally with a password generator or `openssl rand -hex 32`.
Never commit them, print them in workflow output, or put them in this documentation.

## Runtime defaults

- Portainer URL: `https://192.168.1.14:9443`
- Application URL during direct LAN testing: `http://192.168.1.14:3010`
- Application host port: `3010`
- PostgreSQL is internal to the Compose network and is not published to the host
- Database volume: `mealok_postgres_data`
- Database backups: `/var/tmp/mealok-backups` on Docker-VM, retained for 14 days

When TLS is terminated by a reverse proxy, set `MEALOK_NEXTAUTH_URL` to the public HTTPS URL and
redeploy. See [first-run.md](first-run.md).

## First deployment

No stack needs to be created manually. A successful workflow run creates the `mealok` Portainer
stack, initializes PostgreSQL, runs Drizzle migrations, and waits for the application health check.

The production workflow never runs `scripts/seed.ts`. That script is development reset data and
deletes existing rows. Create the first household and account using the procedure in
[first-run.md](first-run.md).
