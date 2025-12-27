import { findSessionWithUser, updateSession, deleteSession } from '@/queries/sessions';
import { UnauthorizedError } from '@/common/errors';
import { hashToken } from '@/common/crypto';
import { SESSION } from '@/common/constants';
import { cookie } from '@/common/cookie';
import { Elysia } from 'elysia';

export const authMacro = new Elysia({ name: 'macro:auth' }).guard({ as: 'scoped', cookie }).macro('auth', {
    resolve: async ({ cookie }) => {
        const token = cookie.session.value;
        if (!token) throw new UnauthorizedError();

        const hashedToken = hashToken(token);
        const [result] = await findSessionWithUser(hashedToken);

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

        const isRenewable = Date.now() >= new Date(session.expires_at).getTime() - SESSION.RENEWAL_THRESHOLD_IN_MS;
        if (isRenewable) {
            const expiresAt = new Date(Date.now() + SESSION.DURATION_IN_MS);
            await updateSession(session.id, { expires_at: expiresAt });
            session.expires_at = expiresAt;
            cookie.session.expires = expiresAt;
        }

        return { user, session };
    },
});
