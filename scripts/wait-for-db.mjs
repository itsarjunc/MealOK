import pg from "pg";

const { Client } = pg;
const maxAttempts = Number.parseInt(process.env.DB_WAIT_MAX_ATTEMPTS ?? "30", 10);
const intervalMs = Number.parseInt(process.env.DB_WAIT_INTERVAL_MS ?? "2000", 10);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    await client.query("select 1");
    await client.end();
    process.exit(0);
  } catch {
    try {
      await client.end();
    } catch {
      // The connection may not have been established.
    }

    if (attempt === maxAttempts) {
      console.error(`PostgreSQL did not become ready after ${maxAttempts} attempts`);
      process.exit(1);
    }

    console.log(`Waiting for PostgreSQL (${attempt}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
