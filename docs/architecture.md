# MealOK architecture

## Runtime shape

MealOK is a Next.js application with a PostgreSQL database. In production both run in the
Portainer-managed `mealok` Compose stack:

```text
Docker-VM
└── Portainer stack: mealok
    ├── mealok-app-1  (Next.js, container port 3000 → host port 3010)
    └── mealok-db-1   (PostgreSQL 15, internal port 5432)
```

The Compose network provides service-name DNS. The application connects to the database using
the hostname `db`, not `localhost`. PostgreSQL has no host port mapping in production.

## Application

- Framework: Next.js 16 App Router
- Runtime image: `node:22-bookworm-slim`
- Build mode: Next standalone output
- Authentication: NextAuth credentials provider with bcrypt password hashes
- ORM: Drizzle ORM
- App health endpoint: `/login`
- Direct LAN URL: `http://192.168.1.14:3010`

The app is served over HTTP by the container. Public HTTPS is expected to terminate at a reverse
proxy, which forwards to host port `3010`.

## Database and data

- Image: `postgres:15-alpine`
- Database/user defaults: `mealok` / `mealok`
- Connection inside the stack: `postgresql://mealok:<password>@db:5432/mealok`
- Persistent volume: `mealok_postgres_data`
- Schema migrations: `src/db/migrations`
- Migration entrypoint: `scripts/migrate.ts`
- Startup migration command: `npm run db:migrate`

The workflow creates a custom-format PostgreSQL dump before updating an existing stack. Backups
are stored on Docker-VM under `/var/tmp/mealok-backups` and older than 14 days are removed.

## Deployment components

| File | Responsibility |
| --- | --- |
| `Dockerfile` | Builds/tests the application image and creates the production runtime image |
| `docker-compose.production.yml` | Defines the app, database, health checks, network, and volume |
| `.github/workflows/deploy-mealok.yml` | Builds, cleans, backs up, deploys, migrates, and verifies |
| `scripts/backup_database.sh` | Creates and rotates PostgreSQL backups |
| `scripts/portainer_deploy.py` | Creates or updates the Portainer standalone stack |
| `scripts/wait-for-db.mjs` | Blocks app startup until PostgreSQL accepts queries |
| `docker/entrypoint.sh` | Runs migrations, then starts Next.js |

## Security boundaries

- GitHub Actions secrets are injected only during the deployment job.
- The Portainer API key is sent in the `X-API-Key` header by the deployment helper.
- The database password is URL-encoded when constructing `DATABASE_URL`.
- The application and database share a private Compose network; only the app port is published.
- The production workflow has no pull-request trigger. This is important because MealOK is a
  public repository using a self-hosted runner.
