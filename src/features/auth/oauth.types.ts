export interface OAuthUserInfo {
    id: string;
    email: string;
    name: string;
    image: string | null;
}

export interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    id_token?: string;
}

export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

export interface GitHubTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
}

export interface GitHubUserInfo {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

export interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
}
