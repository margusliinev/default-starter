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
    return await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 19456,
        timeCost: 2,
    });
}

async function verifyPassword(password: string, hash: string) {
    return await Bun.password.verify(password, hash);
}

function secureCompare(a: string, b: string) {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function checkBreachedPassword(password: string) {
    const hasher = new Bun.CryptoHasher('sha1');
    hasher.update(password);
    const hash = hasher.digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { 'Add-Padding': 'true' },
    });

    if (!response.ok) return false;

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
        const [hashSuffix] = line.split(':');
        if (hashSuffix === suffix) return true;
    }

    return false;
}

function normalizeEmail(email: string) {
    const trimmed = email.toLowerCase().trim();
    const atIndex = trimmed.indexOf('@');

    if (atIndex === -1) return trimmed;

    const local = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1);

    if (domain === 'gmail.com' || domain === 'googlemail.com') {
        const normalized = local.replace(/\./g, '').split('+')[0];
        return `${normalized}@gmail.com`;
    }

    return trimmed;
}

export { generateToken, hashToken, hashPassword, verifyPassword, secureCompare, checkBreachedPassword, normalizeEmail };
