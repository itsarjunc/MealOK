# MealOK operations runbook

All commands below are intended for Docker-VM and are read-only unless explicitly marked as a
backup, restore, or cleanup action.

## Check the stack

```bash
docker compose ls
docker ps --filter label=com.docker.compose.project=mealok
docker inspect mealok-app-1 --format 'status={{.State.Status}} health={{.State.Health.Status}}'
curl -fsS -I http://127.0.0.1:3010/login
```

Expected containers are `mealok-app-1` and `mealok-db-1`. The app should be `healthy`, the DB
should be `healthy`, and `/login` should return HTTP 200.

## Logs

```bash
docker logs --tail 200 mealok-app-1
docker logs --tail 200 mealok-db-1
```

Migration failures usually appear in the app log before `Running migrations...`. Database startup
or authentication failures appear in the database log and the app’s wait-for-DB output.

## Portainer

Open `https://192.168.1.14:9443` and select the `mealok` stack. The workflow owns the stack
definition; avoid editing its Compose content manually because the next deployment will replace it.

The Portainer API key is stored only in GitHub repository secrets as `PORTAINER_API_KEY`. To rotate
it, create a new token in Portainer **My account → Access tokens**, update the GitHub secret, test a
manual deployment, and revoke the old token.

## Database backup

The workflow automatically creates a custom-format dump before updating an existing database:

```text
/var/tmp/mealok-backups/mealok_<UTC timestamp>.dump
```

Backups older than 14 days are removed by the workflow. Check space with:

```bash
du -sh /var/tmp/mealok-backups
df -h /
```

## Database restore

Restore is a deliberate maintenance operation. Stop the app first so it cannot write while the
restore is running, keep the database container running, and use a known-good dump:

```bash
docker stop mealok-app-1
docker exec -e PGPASSWORD='<MEALOK_DB_PASSWORD>' mealok-db-1 \
  pg_restore --clean --if-exists --no-owner --no-privileges \
  --username=mealok --dbname=mealok < /var/tmp/mealok-backups/<backup>.dump
docker start mealok-app-1
```

The password placeholder must be supplied locally and must not be committed or pasted into issue
trackers. Check app health and migration compatibility after restoring.

## Disk hygiene

Every MealOK deployment removes unused MealOK-labeled images and unused Docker BuildKit cache.
Docker volumes are intentionally retained. Inspect usage with:

```bash
docker system df
df -h /
```

Do not use `docker system prune --volumes` on this host. It can remove persistent application data.
The host also has a separate periodic Kuber Docker cleanup timer; it is independent of the MealOK
workflow.

## Runner service

```bash
sudo systemctl status actions.runner.itsarjunc-MealOK.abhiram-lab-docker-vm.service --no-pager
sudo systemctl restart actions.runner.itsarjunc-MealOK.abhiram-lab-docker-vm.service
```

Restart the runner only when it is not executing a deployment. Its directory is
`/home/abhiram/actions-runner-MealOK`; Kuber uses a different runner directory and service.

## Rollback checklist

1. Stop or wait for the current deployment run.
2. Select the last known-good commit/tag in a manual workflow dispatch.
3. Let the normal backup, Portainer update, migration, and health-check path run.
4. Inspect both containers and the public URL.
5. Restore the database only when required by an incompatible migration or data change.

Keep at least one known-good image and database backup until the new release has been exercised.
