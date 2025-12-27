import type {
    OAuthCallbackParams,
    OAuthCallbackSuccess,
    OAuthCallbackError,
    OAuthUserInfo,
    GoogleTokenResponse,
    GitHubTokenResponse,
    GoogleUserInfo,
    GitHubUserInfo,
    GitHubEmail,
} from './oauth.types';
import { generateToken, hashToken, secureCompare, normalizeEmail } from '@/common/crypto';
import { findOAuthAccount, createAccount } from '@/queries/accounts';
import { GOOGLE_OAUTH, GITHUB_OAUTH } from './oauth.constants';
import { findUserByEmail, createUser } from '@/queries/users';
import { InternalServerError } from '@/common/errors';
import { OAUTH, SESSION } from '@/common/constants';
import { createSession } from '@/queries/sessions';
import { Provider } from '@/common/enums';
import { env } from '@/common/env';
import { db } from '@/database';

function getGoogleAuthUrl(state: string) {
    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: GOOGLE_OAUTH.SCOPES,
        state,
    });

    return `${GOOGLE_OAUTH.AUTH_URL}?${params.toString()}`;
}

function getGitHubAuthUrl(state: string) {
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

    return response.json() as Promise<GoogleTokenResponse>;
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

    return response.json() as Promise<GitHubTokenResponse>;
}

async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch(GOOGLE_OAUTH.USER_INFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Google user info');
    }

    const data = (await response.json()) as GoogleUserInfo;

    return {
        id: data.id,
        name: data.name,
        email: normalizeEmail(data.email),
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

    const userData = (await userResponse.json()) as GitHubUserInfo;
    const emailsData = (await emailsResponse.json()) as GitHubEmail[];

    const primaryEmail = emailsData.find((e) => e.primary && e.verified);
    const email = primaryEmail?.email;

    if (!email) {
        throw new Error('No verified email found from GitHub');
    }

    return {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email: normalizeEmail(email),
        image: userData.avatar_url || null,
    };
}

async function getOAuthUserInfo(provider: Provider, code: string): Promise<OAuthUserInfo> {
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

function getOAuthAuthUrl(provider: Provider, state: string) {
    switch (provider) {
        case Provider.GOOGLE:
            return getGoogleAuthUrl(state);
        case Provider.GITHUB:
            return getGitHubAuthUrl(state);
        default:
            throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
}

function getSuccessRedirectUrl() {
    return `${env.FRONTEND_URL}/auth/callback`;
}

function getErrorRedirectUrl(error: string, description?: string) {
    const params = new URLSearchParams({ error });
    if (description) params.set('error_description', description);
    return `${env.FRONTEND_URL}/auth/callback?${params.toString()}`;
}

export function initiateOAuth(provider: Provider) {
    const token = generateToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + OAUTH.DURATION_IN_MS);
    const authUrl = getOAuthAuthUrl(provider, token);

    return { authUrl, hashedToken, expiresAt };
}

export async function handleOAuthCallback(params: OAuthCallbackParams): Promise<OAuthCallbackSuccess | OAuthCallbackError> {
    const { provider, storedState, code, state, error, errorDescription } = params;

    if (error) {
        return { success: false, redirectUrl: getErrorRedirectUrl(error, errorDescription) };
    }

    if (!storedState || !state || !code) {
        return { success: false, redirectUrl: getErrorRedirectUrl('oauth_failed', 'Please restart the process') };
    }

    const providedHash = hashToken(state);
    const isValidState = secureCompare(providedHash, storedState);

    if (!isValidState) {
        return { success: false, redirectUrl: getErrorRedirectUrl('oauth_failed', 'Please restart the process') };
    }

    try {
        const userInfo = await getOAuthUserInfo(provider, code);
        const token = generateToken();
        const hashedToken = hashToken(token);
        const expiresAt = new Date(Date.now() + SESSION.DURATION_IN_MS);

        const [existingAccount] = await findOAuthAccount(provider, userInfo.id);
        if (existingAccount) {
            const session = { user_id: existingAccount.user_id, token: hashedToken, expires_at: expiresAt };
            await createSession(session);

            return { success: true, token, expiresAt, redirectUrl: getSuccessRedirectUrl() };
        }

        const [existingUser] = await findUserByEmail(userInfo.email);
        if (existingUser) {
            return {
                success: false,
                redirectUrl: getErrorRedirectUrl(
                    'account_exists',
                    `Please login with your existing method and link your ${provider} account from settings`,
                ),
            };
        }

        await db.transaction(async (tx) => {
            const [newUser] = await createUser({ name: userInfo.name, email: userInfo.email, image: userInfo.image }, tx);
            if (!newUser) throw new InternalServerError();

            const account = { user_id: newUser.id, provider, provider_id: userInfo.id };
            const session = { user_id: newUser.id, token: hashedToken, expires_at: expiresAt };

            await createAccount(account, tx);
            await createSession(session, tx);
        });

        return { success: true, token, expiresAt, redirectUrl: getSuccessRedirectUrl() };
    } catch {
        return { success: false, redirectUrl: getErrorRedirectUrl('oauth_failed', 'Please restart the process') };
    }
}
