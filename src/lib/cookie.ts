import type { CookieOptions } from 'elysia';
import type { Cookie } from 'elysia';
import { env } from '@/config/env';
import { t } from 'elysia';

const SESSION_COOKIE_NAME = 'session';
const OAUTH_COOKIE_NAME = 'oauth_state';

export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
export const OAUTH_DURATION_MS = 1000 * 60 * 10;

export const cookie: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
};

export const SessionCookie = t.Cookie(
    { session: t.Optional(t.String()) },
    {
        secrets: [env.SESSION_SECRET],
        sign: [SESSION_COOKIE_NAME],
    },
);

export const OauthStateCookie = t.Cookie(
    { oauth_state: t.Optional(t.String()) },
    {
        secrets: [env.SESSION_SECRET],
        sign: [OAUTH_COOKIE_NAME],
    },
);

export const AuthCookies = t.Cookie(
    {
        session: t.Optional(t.String()),
        oauth_state: t.Optional(t.String()),
    },
    {
        secrets: [env.SESSION_SECRET],
        sign: [SESSION_COOKIE_NAME, OAUTH_COOKIE_NAME],
    },
);

export type OAuthCookies = {
    oauth_state: Cookie<string | undefined>;
    session: Cookie<string | undefined>;
};
