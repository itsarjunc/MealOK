# MealOK first-run and public HTTPS setup

## 1. Set the public URL

The container serves HTTP on host port `3010`. Put a reverse proxy in front of it and terminate
TLS there. For the intended public hostname, the GitHub Actions variable should be:

```text
MEALOK_NEXTAUTH_URL=https://means.arjunc.com
```

If the final hostname is different, use that exact browser-visible URL instead. After changing the
variable, redeploy so NextAuth generates callbacks and cookies for the public address.

Example Caddy configuration when Caddy runs on Docker-VM:

```caddyfile
means.arjunc.com {
    reverse_proxy 127.0.0.1:3010
}
```

If the proxy runs on another machine, proxy to `192.168.1.14:3010` and restrict that port to the
proxy’s network. Do not proxy or publish PostgreSQL port `5432`.

## 2. Create the first household

The production deployment creates the schema but does not run development seed data. Registration
requires one household to exist first. On Docker-VM, create one using the database container:

```bash
docker exec -it mealok-db-1 psql -U mealok -d mealok
```

Then run:

```sql
INSERT INTO households (name, timezone, approval_threshold)
VALUES ('My Household', 'Asia/Kolkata', 3);
\q
```

## 3. Register the first user

Open `https://means.arjunc.com/register` after the proxy and DNS are working. Choose the email,
name, and a strong password locally. Registration creates a `RESIDENT` account in the first
household.

If the first account must be an administrator, promote it from the database after registration.
Replace the email placeholder locally; do not put a password in SQL or documentation:

```bash
docker exec -it mealok-db-1 psql -U mealok -d mealok \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';"
```

Do not use `scripts/seed.ts` in production. It is development reset data and deletes existing
households/users before inserting test records.

## 4. Verify the first login

1. Open the public HTTPS URL.
2. Sign in with the account just created.
3. Visit the profile/manage page and change the password if needed.
4. Confirm the browser URL and callback behavior remain on the public HTTPS hostname.

If login redirects to the LAN IP or produces callback errors, correct `MEALOK_NEXTAUTH_URL` and
redeploy.
