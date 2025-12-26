const ARGON2_CONFIG = {
    algorithm: 'argon2id',
    memoryCost: 19456,
    timeCost: 2,
} as const;

const SESSION = {
    COOKIE_NAME: 'session',
    DURATION_MS: 1000 * 60 * 60 * 24 * 30,
} as const;

const OAUTH = {
    COOKIE_NAME: 'oauth_state',
    DURATION_MS: 1000 * 60 * 10,
} as const;

const GOOGLE_OAUTH = {
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    SCOPES: 'openid email profile',
} as const;

const GITHUB_OAUTH = {
    AUTH_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
    USER_URL: 'https://api.github.com/user',
    EMAILS_URL: 'https://api.github.com/user/emails',
    SCOPES: 'read:user user:email',
} as const;

export { ARGON2_CONFIG, SESSION, OAUTH, GOOGLE_OAUTH, GITHUB_OAUTH };
