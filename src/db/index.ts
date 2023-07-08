import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGDATABASE),
    user: process.env.PGPORT,
    password: process.env.PGUSER,
    database: process.env.PGPASSWORD,
});

export const db = drizzle(pool);
