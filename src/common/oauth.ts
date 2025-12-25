import type {
    OAuthUserInfo,
    GoogleTokenResponse,
    GoogleUserInfo,
    GitHubTokenResponse,
    GitHubUserInfo,
    GitHubEmail,
    Cookies,
    OAuthCallbackQuery,
} from '@/common/types';
import type { redirect } from 'elysia';
import { GOOGLE_OAUTH, GITHUB_OAUTH, SESSION, OAUTH } from '@/common/constants';
import { generateToken, hashToken, secureCompare } from '@/common/crypto';
import { Provider } from '@/common/enums';
import { env } from '@/common/env';
import { createUser, findUserByEmail, updateUser } from '@/queries/users';
import { createAccount, findOAuthAccount } from '@/queries/accounts';
import { createSession } from '@/queries/sessions';
import { db } from '@/database/index';

function getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        response_type: 'code',
        scope: GOOGLE_OAUTH.SCOPES,
        state,
    });

    return `${GOOGLE_OAUTH.AUTH_URL}?${params.toString()}`;
}

function getGitHubAuthUrl(state: string): string {
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

    const userData = (await userResponse.json()) as GitHubUserInfo;
    const emailsData = (await emailsResponse.json()) as GitHubEmail[];

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

function getOAuthAuthUrl(provider: Provider, state: string): string {
    switch (provider) {
        case Provider.GOOGLE:
            return getGoogleAuthUrl(state);
        case Provider.GITHUB:
            return getGitHubAuthUrl(state);
        default:
            throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
}

function getOAuthSuccessRedirectUrl(): string {
    return `${env.FRONTEND_URL}/auth/callback`;
}

function getOAuthErrorRedirectUrl(error: string, description?: string): string {
    const params = new URLSearchParams({ error });
    if (description) params.set('error_description', description);
    return `${env.FRONTEND_URL}/auth/callback?${params.toString()}`;
}

function handleOAuthRedirect({ provider, cookie, redirect }: { provider: Provider; cookie: Cookies; redirect: redirect }) {
    const stateToken = generateToken();
    const hashedStateToken = hashToken(stateToken);

    cookie.oauth_state.value = hashedStateToken;
    cookie.oauth_state.expires = new Date(Date.now() + OAUTH.DURATION_MS);

    const authUrl = getOAuthAuthUrl(provider, stateToken);
    return redirect(authUrl);
}

async function handleOauthCallback({
    provider,
    query,
    cookie,
    redirect,
}: {
    provider: Provider;
    query: OAuthCallbackQuery;
    cookie: Cookies;
    redirect: redirect;
}) {
    const storedState = cookie.oauth_state.value;
    cookie.oauth_state.value = undefined;
    cookie.oauth_state.expires = new Date(0);

    if (query.error) {
        return redirect(getOAuthErrorRedirectUrl(query.error, query.error_description));
    }

    if (!storedState || !query.state || !query.code) {
        return redirect(getOAuthErrorRedirectUrl('oauth_failed', 'Please restart the process'));
    }

    const providedHash = hashToken(query.state);
    const isValidState = secureCompare(providedHash, storedState);

    if (!isValidState) {
        return redirect(getOAuthErrorRedirectUrl('oauth_failed', 'Please restart the process'));
    }

    try {
        const userInfo = await getOAuthUserInfo(provider, query.code);
        const plainSessionToken = generateToken();
        const hashedSessionToken = hashToken(plainSessionToken);
        const expiresAt = new Date(Date.now() + SESSION.DURATION_MS);

        const [existingAccount] = await findOAuthAccount(provider, userInfo.id);
        if (existingAccount) {
            await createSession({ user_id: existingAccount.user_id, token: hashedSessionToken, expires_at: expiresAt });
            return { token: plainSessionToken, expiresAt };
        }

        const [existingUser] = await findUserByEmail(userInfo.email);
        if (existingUser) {
            await db.transaction(async (tx) => {
                await createAccount({ user_id: existingUser.id, provider, provider_id: userInfo.id }, tx);

                if (!existingUser.image && userInfo.image) {
                    await updateUser(existingUser.id, { image: userInfo.image }, tx);
                }

                await createSession({ user_id: existingUser.id, token: hashedSessionToken, expires_at: expiresAt }, tx);
            });

            return { token: plainSessionToken, expiresAt };
        }

        await db.transaction(async (tx) => {
            const [newUser] = await createUser({ name: userInfo.name, email: userInfo.email, image: userInfo.image }, tx);
            if (!newUser) throw new Error('Failed to create user during OAuth process');

            await createAccount({ user_id: newUser.id, provider, provider_id: userInfo.id }, tx);
            await createSession({ user_id: newUser.id, token: hashedSessionToken, expires_at: expiresAt }, tx);
        });

        cookie.session.value = plainSessionToken;
        cookie.session.expires = expiresAt;

        return redirect(getOAuthSuccessRedirectUrl());
    } catch {
        return redirect(getOAuthErrorRedirectUrl('oauth_failed', 'Please restart the process'));
    }
}

export { getGoogleAuthUrl, getGitHubAuthUrl, handleOAuthRedirect, handleOauthCallback };
