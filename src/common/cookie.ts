import type { CookieOptions } from 'elysia';
import { env } from '@/common/env';
import { t } from 'elysia';

const cookieOptions: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
};

const cookie = t.Cookie(
    {
        session: t.Optional(t.String()),
        oauth_state: t.Optional(t.String()),
    },
    {
        secrets: [env.SESSION_SECRET],
        sign: ['session', 'oauth_state'],
    },
);

export { cookieOptions, cookie };
