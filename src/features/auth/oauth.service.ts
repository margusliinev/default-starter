import type { GitHubEmail, GitHubTokenResponse, GitHubUserInfo, GoogleTokenResponse, GoogleUserInfo, OAuthUserInfo } from './oauth.types';
import type { Request, Response } from 'express';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GITHUB_OAUTH, GOOGLE_OAUTH } from '../../common/constants/oauth';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { AccountsService } from '../accounts/accounts.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { Provider } from '../../common/enums/provider';
import { ConfigService } from '@nestjs/config';
import { sha256 } from '@oslojs/crypto/sha2';
import { DataSource } from 'typeorm';

@Injectable()
export class OAuthService {
    private readonly STATE_COOKIE_NAME = 'oauth-state';
    private readonly STATE_COOKIE_MAX_AGE = 10 * 60 * 1000;

    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly accountsService: AccountsService,
        private readonly sessionsService: SessionsService,
    ) {}

    private getIsProduction() {
        return this.configService.get('NODE_ENV') === 'production';
    }

    private generateState() {
        return encodeBase64url(crypto.getRandomValues(new Uint8Array(32)));
    }

    private hashState(state: string) {
        return encodeHexLowerCase(sha256(new TextEncoder().encode(state)));
    }

    setStateCookie(res: Response) {
        const state = this.generateState();
        const hashedState = this.hashState(state);

        res.cookie(this.STATE_COOKIE_NAME, hashedState, {
            path: '/',
            httpOnly: true,
            secure: this.getIsProduction(),
            signed: true,
            sameSite: 'lax',
            maxAge: this.STATE_COOKIE_MAX_AGE,
        });

        return state;
    }

    validateState(req: Request, state: string) {
        const storedHash = req.signedCookies?.[this.STATE_COOKIE_NAME];
        if (!storedHash) {
            return false;
        }

        const providedHash = this.hashState(state);
        return storedHash === providedHash;
    }

    clearStateCookie(res: Response) {
        res.clearCookie(this.STATE_COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: this.getIsProduction(),
            signed: true,
            sameSite: 'lax',
        });
    }

    getGoogleAuthUrl(state: string) {
        const clientId = this.configService.get<string>('google.clientId')!;
        const callbackUrl = this.configService.get<string>('google.callbackUrl')!;

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: GOOGLE_OAUTH.SCOPES,
            state,
        });

        return `${GOOGLE_OAUTH.AUTH_URL}?${params.toString()}`;
    }

    async exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
        const clientId = this.configService.get<string>('google.clientId')!;
        const clientSecret = this.configService.get<string>('google.clientSecret')!;
        const callbackUrl = this.configService.get<string>('google.callbackUrl')!;

        const response = await fetch(GOOGLE_OAUTH.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackUrl,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            throw new InternalServerErrorException('Failed to exchange Google authorization code');
        }

        return response.json();
    }

    async getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
        const response = await fetch(GOOGLE_OAUTH.USER_INFO_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            throw new InternalServerErrorException('Failed to fetch Google user info');
        }

        const data: GoogleUserInfo = await response.json();

        return {
            id: data.id,
            email: data.email.toLowerCase(),
            name: data.name,
            image: data.picture || null,
        };
    }

    getGitHubAuthUrl(state: string) {
        const clientId = this.configService.get<string>('github.clientId')!;
        const callbackUrl = this.configService.get<string>('github.callbackUrl')!;

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            scope: GITHUB_OAUTH.SCOPES,
            state,
        });

        return `${GITHUB_OAUTH.AUTH_URL}?${params.toString()}`;
    }

    async exchangeGitHubCode(code: string): Promise<GitHubTokenResponse> {
        const clientId = this.configService.get<string>('github.clientId')!;
        const clientSecret = this.configService.get<string>('github.clientSecret')!;
        const callbackUrl = this.configService.get<string>('github.callbackUrl')!;

        const response = await fetch(GITHUB_OAUTH.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackUrl,
            }),
        });

        if (!response.ok) {
            throw new InternalServerErrorException('Failed to exchange GitHub authorization code');
        }

        return response.json();
    }

    async getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
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
            throw new InternalServerErrorException('Failed to fetch GitHub user info');
        }

        const userData: GitHubUserInfo = await userResponse.json();
        const emailsData: GitHubEmail[] = await emailsResponse.json();

        const primaryEmail = emailsData.find((e) => e.primary && e.verified);
        const email = primaryEmail?.email || userData.email;

        if (!email) {
            throw new InternalServerErrorException('No verified email found from GitHub');
        }

        return {
            id: userData.id.toString(),
            email: email.toLowerCase(),
            name: userData.name || userData.login,
            image: userData.avatar_url || null,
        };
    }

    async getOAuthUserInfo(provider: Provider, code: string): Promise<OAuthUserInfo> {
        switch (provider) {
            case Provider.GOOGLE: {
                const tokens = await this.exchangeGoogleCode(code);
                return this.getGoogleUserInfo(tokens.access_token);
            }
            case Provider.GITHUB: {
                const tokens = await this.exchangeGitHubCode(code);
                return this.getGitHubUserInfo(tokens.access_token);
            }
            default:
                throw new InternalServerErrorException(`Unsupported OAuth provider: ${provider}`);
        }
    }

    redirectToError(res: Response, error: string) {
        const frontendUrl = this.configService.get<string>('frontendUrl')!;
        return res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error)}`);
    }

    async handleOAuthCallback(provider: Provider, userInfo: OAuthUserInfo, res: Response) {
        const frontendUrl = this.configService.get<string>('frontendUrl')!;

        const existingAccount = await this.accountsService.findOAuthAccount(provider, userInfo.id);
        if (existingAccount) {
            const { token, expiresAt } = await this.sessionsService.createSession(existingAccount.user_id);
            this.sessionsService.setSessionCookie(res, token, expiresAt);
            return res.redirect(`${frontendUrl}/auth/callback`);
        }

        const existingUser = await this.usersService.findUserByEmail(userInfo.email);
        if (existingUser) {
            const { token, expiresAt } = await this.dataSource.transaction(async (em) => {
                await this.accountsService.createOAuthAccount(existingUser.id, provider, userInfo.id, em);

                if (!existingUser.image && userInfo.image) {
                    await this.usersService.updateUser(existingUser.id, { image: userInfo.image }, em);
                }

                return await this.sessionsService.createSession(existingUser.id, em);
            });

            this.sessionsService.setSessionCookie(res, token, expiresAt);
            return res.redirect(`${frontendUrl}/auth/callback`);
        }

        const { token, expiresAt } = await this.dataSource.transaction(async (em) => {
            const newUser = await this.usersService.createUser(
                {
                    name: userInfo.name,
                    email: userInfo.email,
                    image: userInfo.image,
                    email_verified_at: new Date(),
                },
                em,
            );
            await this.accountsService.createOAuthAccount(newUser.id, provider, userInfo.id, em);
            return await this.sessionsService.createSession(newUser.id, em);
        });

        this.sessionsService.setSessionCookie(res, token, expiresAt);
        return res.redirect(`${frontendUrl}/auth/callback`);
    }
}
