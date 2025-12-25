import { Value } from '@sinclair/typebox/value';
import { t } from 'elysia';

const schema = t.Object({
    PORT: t.Number({ min: 1, max: 65535 }),
    NODE_ENV: t.Union([t.Literal('development'), t.Literal('production')]),
    SESSION_SECRET: t.String({ minLength: 32 }),
    FRONTEND_URL: t.String(),
    DATABASE_URL: t.String(),
    GITHUB_CLIENT_ID: t.String(),
    GITHUB_CLIENT_SECRET: t.String(),
    GITHUB_CALLBACK_URL: t.String(),
    GOOGLE_CLIENT_ID: t.String(),
    GOOGLE_CLIENT_SECRET: t.String(),
    GOOGLE_CALLBACK_URL: t.String(),
});

const converted = Value.Convert(schema, process.env);

if (!Value.Check(schema, converted)) {
    const errors = [...Value.Errors(schema, converted)].map((error) => `${error.path.slice(1)}: ${error.message}`);
    console.error('Invalid environment variables:');
    console.error(errors.join('\n'));
    process.exit(1);
}

export const env = converted;
