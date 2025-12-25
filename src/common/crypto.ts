import { ARGON2_CONFIG } from './constants';
import { timingSafeEqual } from 'crypto';

function generateToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(bytes).toString('base64url');
}

function hashToken(token: string) {
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(token);
    return hasher.digest('hex');
}

async function hashPassword(password: string) {
    return await Bun.password.hash(password, ARGON2_CONFIG);
}

async function verifyPassword(password: string, hash: string) {
    return await Bun.password.verify(password, hash);
}

function secureCompare(a: string, b: string) {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export { generateToken, hashToken, hashPassword, verifyPassword, secureCompare };
