import type { Static, Cookie } from 'elysia';
import {
    userSelectSchema,
    userInsertSchema,
    userUpdateSchema,
    accountSelectSchema,
    accountInsertSchema,
    accountUpdateSchema,
    sessionSelectSchema,
    sessionInsertSchema,
    sessionUpdateSchema,
} from '@/common/schemas';
import { db } from '@/database';

type User = Static<typeof userSelectSchema>;
type CreateUser = Static<typeof userInsertSchema>;
type UpdateUser = Static<typeof userUpdateSchema>;

type Account = Static<typeof accountSelectSchema>;
type CreateAccount = Static<typeof accountInsertSchema>;
type UpdateAccount = Static<typeof accountUpdateSchema>;

type Session = Static<typeof sessionSelectSchema>;
type CreateSession = Static<typeof sessionInsertSchema>;
type UpdateSession = Static<typeof sessionUpdateSchema>;

interface OAuthUserInfo {
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

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Datasource = typeof db | Transaction;

type Cookies = {
    session: Cookie<string | undefined>;
    oauth_state: Cookie<string | undefined>;
};

type OAuthCallbackQuery = {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
};

export type {
    User,
    CreateUser,
    UpdateUser,
    Account,
    CreateAccount,
    UpdateAccount,
    Session,
    CreateSession,
    UpdateSession,
    OAuthUserInfo,
    GoogleTokenResponse,
    GoogleUserInfo,
    GitHubTokenResponse,
    GitHubUserInfo,
    GitHubEmail,
    Datasource,
    Cookies,
    OAuthCallbackQuery,
};
