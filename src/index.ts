import { ERROR_CLASSES, handleError, cookieOptions, OpenApiTag } from '@/common';
import { featureAuth, featureUsers, featureCrons } from '@/features';
import { client, migrateDatabase } from '@/database';
import { openapi } from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { env } from '@/common/env';

const app = new Elysia({ name: 'app', prefix: '/api', strictPath: true, cookie: cookieOptions })
    .error(ERROR_CLASSES)
    .onError(({ code, error }) => handleError(code, error))
    .onBeforeHandle({ as: 'global' }, ({ set, path }) => {
        if (path === '/api/docs') return;
        set.headers['content-security-policy'] = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
        set.headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains';
        set.headers['referrer-policy'] = 'no-referrer';
        set.headers['x-content-type-options'] = 'nosniff';
        set.headers['x-frame-options'] = 'DENY';
        set.headers['x-xss-protection'] = '0';
    })
    .use(
        cors({
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
            allowedHeaders: ['Content-Type'],
            origin: env.FRONTEND_URL,
            credentials: true,
        }),
    )
    .use(
        openapi({
            path: '/docs',
            documentation: {
                info: {
                    title: 'Default Starter API',
                    description: 'API documentation for the Default Starter API.',
                    version: '1.0.0',
                },
                tags: [
                    { name: OpenApiTag.AUTH, description: 'Auth endpoints' },
                    { name: OpenApiTag.USERS, description: 'Users endpoints' },
                ],
            },
        }),
    )
    .use(featureAuth)
    .use(featureUsers)
    .use(featureCrons)
    .onStart(async () => await migrateDatabase())
    .onStop(async () => await client.close())
    .listen({
        port: env.PORT,
        maxRequestBodySize: 1024 * 1024,
    });

console.log(`API Base URL: http://localhost:${env.PORT}/api`);
console.log(`API Docs URL: http://localhost:${env.PORT}/api/docs`);

process.on('SIGINT', async () => {
    await app.stop();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await app.stop();
    process.exit(0);
});

export type App = typeof app;
