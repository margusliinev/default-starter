import type { Static } from '@sinclair/typebox';
import { SessionCookie, OauthStateCookie, AuthCookies, SESSION_DURATION_MS, OAUTH_DURATION_MS, OAuthCookies } from '@/lib/cookie';
import { getGoogleAuthUrl, getGitHubAuthUrl, getOAuthUserInfo, getOAuthErrorRedirectUrl } from '@/lib/oauth';
import { generateToken, hashToken, hashPassword, verifyPassword, secureCompare } from '@/lib/crypto';
import { findCredentialsAccount, findOAuthAccount, createAccount } from '@/queries/accounts';
import { createSession, deleteSession, deleteUserSessions } from '@/queries/sessions';
import { InternalServerError, ConflictError, UnauthorizedError } from '@/lib/errors';
import { RegisterBody, LoginBody, OAuthCallbackQuery } from '@/schemas/auth';
import { findUserByEmail, createUser, updateUser } from '@/queries/users';
import { ErrorResponse, MessageResponse } from '@/schemas/common';
import { OpenApiTag } from '@/plugins/openapi';
import { authMacro } from '@/macros/auth';
import { Provider } from '@/db/schema';
import { Elysia } from 'elysia';
import { db } from '@/db';
import { env } from '@/config/env';

export const authRoutes = new Elysia({ prefix: '/auth' })
    .use(authMacro)
    .post(
        '/register',
        async ({ body, cookie, set }) => {
            const normalizedEmail = body.email.toLowerCase().trim();

            const [existingUser] = await findUserByEmail(normalizedEmail);
            if (existingUser) throw new ConflictError();

            const plainSessionToken = generateToken();
            const hashedSessionToken = hashToken(plainSessionToken);
            const hashedPassword = await hashPassword(body.password);
            const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

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
            body: RegisterBody,
            cookie: SessionCookie,
            response: {
                201: MessageResponse,
                409: ErrorResponse,
                422: ErrorResponse,
                500: ErrorResponse,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Register',
                description: 'Creates a new user account.',
            },
        },
    )
    .post(
        '/login',
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
            const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

            await createSession({ user_id: user.id, token: hashedSessionToken, expires_at: expiresAt });

            cookie.session.value = plainSessionToken;
            cookie.session.expires = expiresAt;

            return { message: 'Login successful' };
        },
        {
            body: LoginBody,
            cookie: SessionCookie,
            response: {
                200: MessageResponse,
                401: ErrorResponse,
                422: ErrorResponse,
                500: ErrorResponse,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Login',
                description: 'Authenticates the user.',
            },
        },
    )
    .post(
        '/logout',
        async ({ cookie, session }) => {
            await deleteSession(session.id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            return { message: 'Logout successful' };
        },
        {
            auth: true,
            response: {
                200: MessageResponse,
                401: ErrorResponse,
                500: ErrorResponse,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Logout',
                description: 'Ends the current session.',
            },
        },
    )
    .post(
        '/logout-all',
        async ({ cookie, session }) => {
            await deleteUserSessions(session.user_id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            return { message: 'Logout all successful' };
        },
        {
            auth: true,
            response: {
                200: MessageResponse,
                401: ErrorResponse,
                500: ErrorResponse,
            },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Logout all',
                description: 'Ends all user sessions.',
            },
        },
    )
    .get(
        '/github',
        async ({ cookie, redirect }) => {
            const stateToken = generateToken();
            const hashedStateToken = hashToken(stateToken);

            cookie.oauth_state.value = hashedStateToken;
            cookie.oauth_state.expires = new Date(Date.now() + OAUTH_DURATION_MS);

            const authUrl = getGitHubAuthUrl(stateToken);
            return redirect(authUrl);
        },
        {
            cookie: OauthStateCookie,
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'GitHub OAuth',
                description: 'Redirects to GitHub for authentication.',
            },
        },
    )
    .get(
        '/google',
        async ({ cookie, redirect }) => {
            const stateToken = generateToken();
            const hashedStateToken = hashToken(stateToken);

            cookie.oauth_state.value = hashedStateToken;
            cookie.oauth_state.expires = new Date(Date.now() + OAUTH_DURATION_MS);

            const authUrl = getGoogleAuthUrl(stateToken);
            return redirect(authUrl);
        },
        {
            cookie: OauthStateCookie,
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Google OAuth',
                description: 'Redirects to Google for authentication.',
            },
        },
    )
    .get(
        '/github/callback',
        async ({ query, cookie, redirect }) => {
            return handleOAuthCallback(Provider.GITHUB, query, cookie, redirect);
        },
        {
            query: OAuthCallbackQuery,
            cookie: AuthCookies,
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'GitHub OAuth Callback',
                description: 'Handles the callback from GitHub OAuth.',
            },
        },
    )
    .get(
        '/google/callback',
        async ({ query, cookie, redirect }) => {
            return handleOAuthCallback(Provider.GOOGLE, query, cookie, redirect);
        },
        {
            query: OAuthCallbackQuery,
            cookie: AuthCookies,
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Google OAuth Callback',
                description: 'Handles the callback from Google OAuth.',
            },
        },
    );

async function handleOAuthCallback(
    provider: Provider,
    query: Static<typeof OAuthCallbackQuery>,
    cookie: OAuthCookies,
    redirect: (url: string) => Response,
) {
    const storedState = cookie.oauth_state.value;
    cookie.oauth_state.value = undefined;
    cookie.oauth_state.expires = new Date(0);

    if (query.error) {
        return redirect(getOAuthErrorRedirectUrl(query.error, query.error_description));
    }

    if (!storedState || !query.state || !query.code) {
        return redirect(getOAuthErrorRedirectUrl('oauth_failed', 'Please restart the process'));
    }

    const providedHash = hashToken(query.state);
    const isValidState = secureCompare(providedHash, storedState);

    if (!isValidState) {
        return redirect(getOAuthErrorRedirectUrl('oauth_failed', 'Please restart the process'));
    }

    try {
        const userInfo = await getOAuthUserInfo(provider, query.code);
        const plainSessionToken = generateToken();
        const hashedSessionToken = hashToken(plainSessionToken);
        const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

        const [existingAccount] = await findOAuthAccount(provider, userInfo.id);
        if (existingAccount && existingAccount.user_id) {
            await createSession({ user_id: existingAccount.user_id, token: hashedSessionToken, expires_at: expiresAt });
            return { token: plainSessionToken, expiresAt };
        }

        const [existingUser] = await findUserByEmail(userInfo.email);
        if (existingUser) {
            await db.transaction(async (tx) => {
                await createAccount({ user_id: existingUser.id, provider, provider_id: userInfo.id }, tx);

                if (!existingUser.image && userInfo.image) {
                    await updateUser(existingUser.id, { image: userInfo.image }, tx);
                }

                await createSession({ user_id: existingUser.id, token: hashedSessionToken, expires_at: expiresAt }, tx);
            });

            return { token: plainSessionToken, expiresAt };
        }

        await db.transaction(async (tx) => {
            const [newUser] = await createUser({ name: userInfo.name, email: userInfo.email, image: userInfo.image }, tx);
            if (!newUser) throw new InternalServerError();

            await createAccount({ user_id: newUser.id, provider, provider_id: userInfo.id }, tx);
            await createSession({ user_id: newUser.id, token: hashedSessionToken, expires_at: expiresAt }, tx);
        });
        cookie.session.value = plainSessionToken;
        cookie.session.expires = expiresAt;
        return redirect(`${env.FRONTEND_URL}/auth/callback`);
    } catch {
        return redirect(getOAuthErrorRedirectUrl('oauth_failed', 'Please restart the process'));
    }
}
