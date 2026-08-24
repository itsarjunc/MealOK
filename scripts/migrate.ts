import 'dotenv/config';
import { db } from '../src/db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

async function runMigrations() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations completed!');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
