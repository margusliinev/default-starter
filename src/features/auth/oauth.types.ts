import { Provider } from '@/common/enums';

type OAuthCallbackParams = {
    provider: Provider;
    storedState: string | undefined;
    code: string | undefined;
    state: string | undefined;
    error: string | undefined;
    errorDescription: string | undefined;
};

type OAuthCallbackSuccess = {
    success: true;
    token: string;
    expiresAt: Date;
    redirectUrl: string;
};

type OAuthCallbackError = {
    success: false;
    redirectUrl: string;
};

type OAuthUserInfo = {
    id: string;
    name: string;
    email: string;
    image: string | null;
};

type GoogleTokenResponse = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    id_token?: string;
};

type GitHubTokenResponse = {
    access_token: string;
    token_type: string;
    scope: string;
};

type GoogleUserInfo = {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
};

type GitHubUserInfo = {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
};

type GitHubEmail = {
    email: string;
    primary: boolean;
    verified: boolean;
};

export type {
    OAuthCallbackParams,
    OAuthCallbackSuccess,
    OAuthCallbackError,
    OAuthUserInfo,
    GoogleTokenResponse,
    GitHubTokenResponse,
    GoogleUserInfo,
    GitHubUserInfo,
    GitHubEmail,
};
