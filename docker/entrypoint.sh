#!/bin/sh
set -eu

if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
  node /app/scripts/wait-for-db.mjs
  npm run db:migrate
fi

exec node /app/server.js
