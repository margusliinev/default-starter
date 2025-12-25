import { errorClasses, handleError } from './lib/errors';
import { migrateDatabase } from './db/migrate';
import { openapiPlugin } from './plugins/openapi';
import { cronPlugin } from './plugins/cron';
import { usersRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { cookie } from './lib/cookie';
import { client } from './db';
import { Elysia } from 'elysia';
import { env } from './config/env';

const app = new Elysia({ prefix: '/api', cookie })
    .error(errorClasses)
    .onError(({ code, error }) => handleError(code, error))
    .use(openapiPlugin)
    .use(cronPlugin)
    .use(authRoutes)
    .use(usersRoutes)
    .onStart(async () => await migrateDatabase())
    .onStop(async () => await client.close())
    .listen(env.PORT);

console.log(`API Server is listening at http://localhost:${env.PORT}/api`);
console.log(`API Documentation is available at http://localhost:${env.PORT}/api/docs`);

process.on('SIGINT', async () => {
    await app.stop();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await app.stop();
    process.exit(0);
});

export type App = typeof app;
