import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './migrations',
    schema: './src/database/schema.ts',
    dialect: 'postgresql',
    verbose: true,
    strict: true,
});
