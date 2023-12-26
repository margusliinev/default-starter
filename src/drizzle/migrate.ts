import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(client, { schema });

const start = async () => {
    await client.connect();
    await migrate(db, { migrationsFolder: './src/drizzle/migrations' });
    await client.end();
};

start().catch((error) => {
    console.error(error);
    process.exit(1);
});
