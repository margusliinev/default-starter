import {
    ErrorSchema,
    LoginSchema,
    MessageSchema,
    OAuthCallbackQuerySchema,
    RegisterSchema,
    userSelectSchema,
    userUpdateSchema,
    VoidSchema,
} from '@/common/schemas';
import { handleError, UnauthorizedError, ConflictError, InternalServerError, ERROR_CLASSES } from '@/common/errors';
import { generateToken, hashToken, hashPassword, verifyPassword } from '@/common/crypto';
import { handleOAuthRedirect, handleOauthCallback } from '@/common/oauth';
import { cookieOptions, cookieSchema } from '@/common/cookie';
import { Provider, OpenApiTag } from '@/common/enums';
import { SESSION } from '@/common/constants';
import { env } from '@/common/env';
import { createSession, deleteSession, deleteUserSessions, findSessionWithUser, updateSession } from '@/queries/sessions';
import { createUser, deleteUser, findUserByEmail, updateUser } from '@/queries/users';
import { createAccount, findCredentialsAccount } from '@/queries/accounts';
import { client, db, migrateDatabase } from '@/database/index';
import { openapi } from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { cronjobs } from '@/crons';

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
    .guard({ as: 'scoped', cookie: cookieSchema })
    .macro('auth', {
        resolve: async ({ cookie }) => {
            const plainSessionToken = cookie.session.value;
            if (!plainSessionToken) throw new UnauthorizedError();

            const hashedSessionToken = hashToken(plainSessionToken);
            const [result] = await findSessionWithUser(hashedSessionToken);

            if (!result) {
                cookie.session.value = undefined;
                cookie.session.expires = new Date(0);
                throw new UnauthorizedError();
            }

            const { session, user } = result;

            const isExpired = Date.now() >= new Date(session.expires_at).getTime();
            if (isExpired) {
                await deleteSession(session.id);
                cookie.session.value = undefined;
                cookie.session.expires = new Date(0);
                throw new UnauthorizedError();
            }

            const isRenewable = Date.now() >= new Date(session.expires_at).getTime() - SESSION.DURATION_MS;
            if (isRenewable) {
                const expiresAt = new Date(Date.now() + SESSION.DURATION_MS);
                await updateSession(session.id, { expires_at: expiresAt });
                session.expires_at = expiresAt;
                cookie.session.expires = expiresAt;
            }

            return { user, session };
        },
    })
    .post(
        '/auth/register',
        async ({ body, cookie, set }) => {
            const normalizedEmail = body.email.toLowerCase().trim();

            const [existingUser] = await findUserByEmail(normalizedEmail);
            if (existingUser) throw new ConflictError();

            const plainSessionToken = generateToken();
            const hashedSessionToken = hashToken(plainSessionToken);
            const hashedPassword = await hashPassword(body.password);
            const expiresAt = new Date(Date.now() + SESSION.DURATION_MS);

            await db.transaction(async (tx) => {
                const [user] = await createUser({ name: body.name, email: normalizedEmail }, tx);
                if (!user) throw new InternalServerError();

                await createAccount(
                    { user_id: user.id, provider: Provider.CREDENTIALS, provider_id: user.id, password: hashedPassword },
                    tx,
                );
                await createSession({ user_id: user.id, token: hashedSessionToken, expires_at: expiresAt }, tx);
            });

            cookie.session.value = plainSessionToken;
            cookie.session.expires = expiresAt;

            set.status = 201;
            return { message: 'Register successful' };
        },
        {
            body: RegisterSchema,
            response: {
                201: MessageSchema,
                409: ErrorSchema,
                422: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Register',
                description: 'Creates a new user account.',
            },
        },
    )
    .post(
        '/auth/login',
        async ({ body, cookie }) => {
            const normalizedEmail = body.email.toLowerCase().trim();

            const [user] = await findUserByEmail(normalizedEmail);
            if (!user) throw new UnauthorizedError();

            const [account] = await findCredentialsAccount(user.id);
            if (!account || !account.password) throw new UnauthorizedError();

            const isValidPassword = await verifyPassword(body.password, account.password);
            if (!isValidPassword) throw new UnauthorizedError();

            const plainSessionToken = generateToken();
            const hashedSessionToken = hashToken(plainSessionToken);
            const expiresAt = new Date(Date.now() + SESSION.DURATION_MS);

            await createSession({ user_id: user.id, token: hashedSessionToken, expires_at: expiresAt });

            cookie.session.value = plainSessionToken;
            cookie.session.expires = expiresAt;

            return { message: 'Login successful' };
        },
        {
            body: LoginSchema,
            response: {
                200: MessageSchema,
                401: ErrorSchema,
                422: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Login',
                description: 'Authenticates the user.',
            },
        },
    )
    .post(
        '/auth/logout',
        async ({ cookie, session }) => {
            await deleteSession(session.id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            return { message: 'Logout successful' };
        },
        {
            auth: true,
            response: {
                200: MessageSchema,
                401: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Logout',
                description: 'Ends the current session.',
            },
        },
    )
    .post(
        '/auth/logout-all',
        async ({ cookie, session }) => {
            await deleteUserSessions(session.user_id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            return { message: 'Logout all successful' };
        },
        {
            auth: true,
            response: {
                200: MessageSchema,
                401: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Logout all',
                description: 'Ends all user sessions.',
            },
        },
    )
    .get('/auth/google', ({ cookie, redirect }) => handleOAuthRedirect({ provider: Provider.GOOGLE, cookie, redirect }), {
        response: { 302: VoidSchema },
        detail: {
            tags: [OpenApiTag.AUTH],
            summary: 'Google OAuth',
            description: 'Redirects to Google for authentication.',
        },
    })
    .get('/auth/github', ({ cookie, redirect }) => handleOAuthRedirect({ provider: Provider.GITHUB, cookie, redirect }), {
        response: { 302: VoidSchema },
        detail: {
            tags: [OpenApiTag.AUTH],
            summary: 'GitHub OAuth',
            description: 'Redirects to GitHub for authentication.',
        },
    })
    .get(
        '/auth/google/callback',
        async ({ query, cookie, redirect }) => handleOauthCallback({ provider: Provider.GOOGLE, query, cookie, redirect }),
        {
            query: OAuthCallbackQuerySchema,
            response: { 302: VoidSchema },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Google OAuth Callback',
                description: 'Handles the callback from Google OAuth.',
            },
        },
    )
    .get(
        '/auth/github/callback',
        async ({ query, cookie, redirect }) => handleOauthCallback({ provider: Provider.GITHUB, query, cookie, redirect }),
        {
            query: OAuthCallbackQuerySchema,
            response: { 302: VoidSchema },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'GitHub OAuth Callback',
                description: 'Handles the callback from GitHub OAuth.',
            },
        },
    )
    .get('/users/me', ({ user }) => user, {
        auth: true,
        response: {
            200: userSelectSchema,
            401: ErrorSchema,
            500: ErrorSchema,
        },
        detail: {
            tags: [OpenApiTag.USERS],
            summary: 'Get me',
            description: 'Gets the current user.',
        },
    })
    .patch(
        '/users/me',
        async ({ user, body }) => {
            const [updatedUser] = await updateUser(user.id, body);
            if (!updatedUser) throw new InternalServerError();

            return updatedUser;
        },
        {
            auth: true,
            body: userUpdateSchema,
            response: {
                200: userSelectSchema,
                401: ErrorSchema,
                422: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.USERS],
                summary: 'Update me',
                description: 'Updates the current user.',
            },
        },
    )
    .delete(
        '/users/me',
        async ({ user, cookie, set }) => {
            await deleteUser(user.id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            set.status = 204;
            return;
        },
        {
            auth: true,
            response: {
                204: VoidSchema,
                401: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.USERS],
                summary: 'Delete me',
                description: 'Deletes the current user.',
            },
        },
    )
    .use(cronjobs)
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
