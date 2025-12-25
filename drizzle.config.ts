import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './migrations',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    verbose: true,
    strict: true,
});
