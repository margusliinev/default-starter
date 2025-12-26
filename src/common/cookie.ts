import type { CookieOptions } from 'elysia';
import { SESSION, OAUTH } from '@/common';
import { env } from '@/common/env';
import { t } from 'elysia';

const cookieOptions: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
};

const cookieSchema = t.Cookie(
    {
        session: t.Optional(t.String()),
        oauth_state: t.Optional(t.String()),
    },
    {
        secrets: [env.SESSION_SECRET],
        sign: [SESSION.COOKIE_NAME, OAUTH.COOKIE_NAME],
    },
);

export { cookieOptions, cookieSchema };
