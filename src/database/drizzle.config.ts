import { defineConfig } from 'drizzle-kit';
import { env } from '@/common/env';

export default defineConfig({
    out: './migrations',
    schema: './src/database/schema.ts',
    migrations: { schema: 'public', table: 'migrations' },
    dbCredentials: { url: env.DATABASE_URL },
    dialect: 'postgresql',
    verbose: true,
    strict: true,
});
