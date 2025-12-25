import { Provider } from '@/db/schema';
import { env } from '@/config/env';

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

export interface OAuthUserInfo {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    id_token?: string;
}

interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

interface GitHubTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
}

interface GitHubUserInfo {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
}

export function getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: GOOGLE_OAUTH.SCOPES,
        state,
    });

    return `${GOOGLE_OAUTH.AUTH_URL}?${params.toString()}`;
}

export function getGitHubAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: env.GITHUB_CALLBACK_URL,
        scope: GITHUB_OAUTH.SCOPES,
        state,
    });

    return `${GITHUB_OAUTH.AUTH_URL}?${params.toString()}`;
}

async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch(GOOGLE_OAUTH.TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: env.GOOGLE_CALLBACK_URL,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange Google authorization code');
    }

    return response.json();
}

async function exchangeGitHubCode(code: string): Promise<GitHubTokenResponse> {
    const response = await fetch(GITHUB_OAUTH.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: new URLSearchParams({
            code,
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            redirect_uri: env.GITHUB_CALLBACK_URL,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange GitHub authorization code');
    }

    return response.json();
}

async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(GOOGLE_OAUTH.USER_INFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Google user info');
    }

    const data: GoogleUserInfo = await response.json();

    return {
        id: data.id,
        name: data.name,
        email: data.email.toLowerCase().trim(),
        image: data.picture || null,
    };
}

async function getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const [userResponse, emailsResponse] = await Promise.all([
        fetch(GITHUB_OAUTH.USER_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
            },
        }),
        fetch(GITHUB_OAUTH.EMAILS_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
            },
        }),
    ]);

    if (!userResponse.ok || !emailsResponse.ok) {
        throw new Error('Failed to fetch GitHub user info');
    }

    const userData: GitHubUserInfo = await userResponse.json();
    const emailsData: GitHubEmail[] = await emailsResponse.json();

    const primaryEmail = emailsData.find((e) => e.primary && e.verified);
    const email = primaryEmail?.email || userData.email;

    if (!email) {
        throw new Error('No verified email found from GitHub');
    }

    return {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email: email.toLowerCase().trim(),
        image: userData.avatar_url || null,
    };
}

export async function getOAuthUserInfo(provider: Provider, code: string): Promise<OAuthUserInfo> {
    switch (provider) {
        case Provider.GOOGLE: {
            const tokens = await exchangeGoogleCode(code);
            return getGoogleUserInfo(tokens.access_token);
        }
        case Provider.GITHUB: {
            const tokens = await exchangeGitHubCode(code);
            return getGitHubUserInfo(tokens.access_token);
        }
        default:
            throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
}

export function getOAuthErrorRedirectUrl(error: string, description?: string): string {
    const params = new URLSearchParams({ error });
    if (description) params.set('error_description', description);
    return `${env.FRONTEND_URL}/auth/callback?${params.toString()}`;
}
