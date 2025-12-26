import { UnauthorizedError, cookieSchema, hashToken, SESSION } from '@/common';
import { findSessionWithUser, deleteSession, updateSession } from '@/queries';
import { Elysia } from 'elysia';

export const macroAuth = new Elysia({ name: 'macro:auth' }).guard({ as: 'scoped', cookie: cookieSchema }).macro('auth', {
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
});
