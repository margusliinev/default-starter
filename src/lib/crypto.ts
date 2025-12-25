import { timingSafeEqual } from 'crypto';

const ARGON2_CONFIG = {
    algorithm: 'argon2id',
    memoryCost: 19456,
    timeCost: 2,
} as const;

export function generateToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(bytes).toString('base64url');
}

export function hashToken(token: string) {
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(token);
    return hasher.digest('hex');
}

export async function hashPassword(password: string) {
    return await Bun.password.hash(password, ARGON2_CONFIG);
}

export async function verifyPassword(password: string, hash: string) {
    return await Bun.password.verify(password, hash);
}

export function secureCompare(a: string, b: string) {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
