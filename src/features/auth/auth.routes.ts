import { ErrorSchema, MessageSchema, RedirectSchema } from '@/common/schemas';
import { register, login, logout, logoutAll } from './auth.service';
import { initiateOAuth, handleOAuthCallback } from './oauth.service';
import { RegisterSchema, LoginSchema } from './auth.schemas';
import { OAuthCallbackQuerySchema } from './oauth.schemas';
import { Provider, OpenApiTag } from '@/common/enums';
import { authMacro } from '@/macros/auth';
import { cookie } from '@/common/cookie';
import { Elysia } from 'elysia';

export const authRoutes = new Elysia({ name: 'route:auth', prefix: '/auth' })
    .guard({ as: 'scoped', cookie })
    .use(authMacro)
    .post(
        '/register',
        async ({ body, cookie, set }) => {
            const { token, expiresAt } = await register(body);

            cookie.session.value = token;
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
        '/login',
        async ({ body, cookie }) => {
            const { token, expiresAt } = await login(body);

            cookie.session.value = token;
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
        '/logout',
        async ({ cookie, session }) => {
            await logout(session.id);

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
        '/logout-all',
        async ({ cookie, session }) => {
            await logoutAll(session.user_id);

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
    .get(
        '/google',
        ({ cookie, redirect }) => {
            const { authUrl, hashedToken, expiresAt } = initiateOAuth(Provider.GOOGLE);

            cookie.oauth_state.value = hashedToken;
            cookie.oauth_state.expires = expiresAt;

            return redirect(authUrl);
        },
        {
            response: { 302: RedirectSchema },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Google OAuth',
                description: 'Redirects to Google for authentication.',
            },
        },
    )
    .get(
        '/github',
        ({ cookie, redirect }) => {
            const { authUrl, hashedToken, expiresAt } = initiateOAuth(Provider.GITHUB);

            cookie.oauth_state.value = hashedToken;
            cookie.oauth_state.expires = expiresAt;

            return redirect(authUrl);
        },
        {
            response: { 302: RedirectSchema },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'GitHub OAuth',
                description: 'Redirects to GitHub for authentication.',
            },
        },
    )
    .get(
        '/google/callback',
        async ({ query, cookie, redirect }) => {
            const storedState = cookie.oauth_state.value;
            cookie.oauth_state.value = undefined;
            cookie.oauth_state.expires = new Date(0);

            const result = await handleOAuthCallback({
                provider: Provider.GOOGLE,
                storedState,
                code: query.code,
                state: query.state,
                error: query.error,
                errorDescription: query.error_description,
            });

            if (result.success) {
                cookie.session.value = result.token;
                cookie.session.expires = result.expiresAt;
            }

            return redirect(result.redirectUrl);
        },
        {
            query: OAuthCallbackQuerySchema,
            response: { 302: RedirectSchema },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'Google OAuth Callback',
                description: 'Handles the callback from Google OAuth.',
            },
        },
    )
    .get(
        '/github/callback',
        async ({ query, cookie, redirect }) => {
            const storedState = cookie.oauth_state.value;
            cookie.oauth_state.value = undefined;
            cookie.oauth_state.expires = new Date(0);

            const result = await handleOAuthCallback({
                provider: Provider.GITHUB,
                storedState,
                code: query.code,
                state: query.state,
                error: query.error,
                errorDescription: query.error_description,
            });

            if (result.success) {
                cookie.session.value = result.token;
                cookie.session.expires = result.expiresAt;
            }

            return redirect(result.redirectUrl);
        },
        {
            query: OAuthCallbackQuerySchema,
            response: { 302: RedirectSchema },
            detail: {
                tags: [OpenApiTag.AUTH],
                summary: 'GitHub OAuth Callback',
                description: 'Handles the callback from GitHub OAuth.',
            },
        },
    );
