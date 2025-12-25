import { migrate } from 'drizzle-orm/bun-sql/migrator';
import { drizzle } from 'drizzle-orm/bun-sql';
import { relations } from './relations';
import { env } from '@/config/env';
import { SQL } from 'bun';
import * as schema from './schema';

const client = new SQL({
    url: env.DATABASE_URL,
    max: 1,
});

const db = drizzle({
    client,
    schema,
    relations,
});

export async function migrateDatabase() {
    try {
        console.info('🚀 Database migrations started');

        await client.connect();
        await migrate(db, { migrationsFolder: './migrations', migrationsSchema: 'public', migrationsTable: 'migrations' });

        console.info('✅ Database migrations completed');
    } catch (error) {
        console.error('❌ Database migrations failed');
        console.error(error);
        throw error;
    } finally {
        await client.close();
    }
}
