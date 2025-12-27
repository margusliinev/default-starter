import type { Register, Login } from './auth.types';
import type { Session } from '@/common/types';
import { generateToken, hashToken, hashPassword, verifyPassword, checkBreachedPassword, normalizeEmail } from '@/common/crypto';
import { ConflictError, InternalServerError, UnauthorizedError, ValidationError } from '@/common/errors';
import { createSession, deleteSession, deleteUserSessions } from '@/queries/sessions';
import { findCredentialsAccount, createAccount } from '@/queries/accounts';
import { findUserByEmail, createUser } from '@/queries/users';
import { SESSION } from '@/common/constants';
import { Provider } from '@/common/enums';
import { db } from '@/database';

async function register(register: Register) {
    const normalizedEmail = normalizeEmail(register.email);

    const [existingUser] = await findUserByEmail(normalizedEmail);
    if (existingUser) throw new ConflictError({ email: 'An account with this email already exists' });

    const isBreached = await checkBreachedPassword(register.password);
    if (isBreached) throw new ValidationError({ password: 'This password is too common, please choose a stronger one' });

    const token = generateToken();
    const hashedToken = hashToken(token);
    const hashedPassword = await hashPassword(register.password);
    const expiresAt = new Date(Date.now() + SESSION.DURATION_IN_MS);

    await db.transaction(async (tx) => {
        const [user] = await createUser({ name: register.name, email: normalizedEmail }, tx);
        if (!user) throw new InternalServerError();

        const account = { user_id: user.id, provider: Provider.CREDENTIALS, provider_id: user.id, password: hashedPassword };
        const session = { user_id: user.id, token: hashedToken, expires_at: expiresAt };

        await createAccount(account, tx);
        await createSession(session, tx);
    });

    return { token, expiresAt };
}

async function login(params: Login) {
    const normalizedEmail = normalizeEmail(params.email);

    const [user] = await findUserByEmail(normalizedEmail);
    if (!user) throw new UnauthorizedError();

    const [account] = await findCredentialsAccount(user.id);
    if (!account || !account.password) throw new UnauthorizedError();

    const isValidPassword = await verifyPassword(params.password, account.password);
    if (!isValidPassword) throw new UnauthorizedError();

    const token = generateToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION.DURATION_IN_MS);
    const session = { user_id: user.id, token: hashedToken, expires_at: expiresAt };

    await createSession(session);

    return { token, expiresAt };
}

async function logout(sessionId: Session['id']) {
    await deleteSession(sessionId);
}

async function logoutAll(userId: Session['user_id']) {
    await deleteUserSessions(userId);
}

export { register, login, logout, logoutAll };
