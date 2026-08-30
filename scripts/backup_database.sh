#!/usr/bin/env bash
set -euo pipefail

: "${STACK_NAME:?STACK_NAME is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

backup_dir="${BACKUP_DIR:-/var/tmp/mealok-backups}"
mkdir -p "${backup_dir}"
chmod 700 "${backup_dir}"

db_container="$(docker ps -a \
  --filter "label=com.docker.compose.project=${STACK_NAME}" \
  --filter "label=com.docker.compose.service=db" \
  --format '{{.ID}}' | head -n 1)"

if [ -z "${db_container}" ]; then
  echo "No existing database container found for stack ${STACK_NAME}; skipping first-deploy backup."
  exit 0
fi

db_status="$(docker inspect --format '{{.State.Status}}' "${db_container}")"
if [ "${db_status}" != "running" ]; then
  echo "Database container ${db_container} is ${db_status}; refusing to deploy without a backup." >&2
  exit 1
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_path="${backup_dir}/${STACK_NAME}_${timestamp}.dump"
temporary_path="${backup_path}.tmp"
trap 'rm -f -- "${temporary_path}"' EXIT

docker exec \
  -e PGPASSWORD="${POSTGRES_PASSWORD}" \
  "${db_container}" \
  pg_dump --format=custom --no-owner --no-privileges \
    --username="${POSTGRES_USER}" \
    --dbname="${POSTGRES_DB}" > "${temporary_path}"

chmod 600 "${temporary_path}"
mv -- "${temporary_path}" "${backup_path}"
find "${backup_dir}" -maxdepth 1 -type f -name "${STACK_NAME}_*.dump" -mtime +14 -delete

echo "Database backup created at ${backup_path}"
