export const GOOGLE_OAUTH = {
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    SCOPES: 'openid email profile',
} as const;

export const GITHUB_OAUTH = {
    AUTH_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
    USER_URL: 'https://api.github.com/user',
    EMAILS_URL: 'https://api.github.com/user/emails',
    SCOPES: 'read:user user:email',
} as const;
