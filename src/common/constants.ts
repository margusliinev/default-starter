const SESSION = {
    COOKIE_NAME: 'session',
    DURATION_MS: 1000 * 60 * 60 * 24 * 30,
} as const;

const OAUTH = {
    COOKIE_NAME: 'oauth_state',
    DURATION_MS: 1000 * 60 * 10,
} as const;

const ARGON2_CONFIG = {
    algorithm: 'argon2id',
    memoryCost: 19456,
    timeCost: 2,
} as const;

const ELYSIA_ERRORS = {
    PARSE: { status: 400, message: 'Parse Error' },
    BAD_REQUEST: { status: 400, message: 'Bad Request' },
    INVALID_COOKIE_SIGNATURE: { status: 400, message: 'Invalid Cookie Signature' },
    UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
    PAYMENT_REQUIRED: { status: 402, message: 'Payment Required' },
    FORBIDDEN: { status: 403, message: 'Forbidden' },
    NOT_FOUND: { status: 404, message: 'Not Found' },
    CONFLICT: { status: 409, message: 'Conflict' },
    GONE: { status: 410, message: 'Gone' },
    UNSUPPORTED_MEDIA_TYPE: { status: 415, message: 'Unsupported Media Type' },
    INVALID_FILE_TYPE: { status: 415, message: 'Invalid File Type' },
    VALIDATION: { status: 422, message: 'Unprocessable Entity' },
    TOO_MANY_REQUESTS: { status: 429, message: 'Too Many Requests' },
    INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal Server Error' },
    UNKNOWN: { status: 500, message: 'Unknown Error' },
    SERVICE_UNAVAILABLE: { status: 503, message: 'Service Unavailable' },
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

export { SESSION, OAUTH, ARGON2_CONFIG, ELYSIA_ERRORS, GOOGLE_OAUTH, GITHUB_OAUTH };
