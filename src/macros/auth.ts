import { findSessionWithUser, updateSession, deleteSession } from '@/queries/sessions';
import { SessionCookie, SESSION_DURATION_MS } from '@/lib/cookie';
import { UnauthorizedError } from '@/lib/errors';
import { hashToken } from '@/lib/crypto';
import { Elysia } from 'elysia';

export const authMacro = new Elysia().macro('auth', {
    cookie: SessionCookie,
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

        const isRenewable = Date.now() >= new Date(session.expires_at).getTime() - SESSION_DURATION_MS;
        if (isRenewable) {
            const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
            await updateSession(session.id, { expires_at: expiresAt });
            session.expires_at = expiresAt;
            cookie.session.expires = expiresAt;
        }

        return { user, session };
    },
});
