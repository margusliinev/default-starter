import type { GitHubEmail, GitHubTokenResponse, GitHubUserInfo, GoogleTokenResponse, GoogleUserInfo, OAuthUserInfo } from './oauth.types';
import type { Request, Response } from 'express';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { Provider } from '../../common/enums/provider';
import { ConfigService } from '@nestjs/config';
import { sha256 } from '@oslojs/crypto/sha2';

@Injectable()
export class OAuthService {
    private readonly STATE_COOKIE_NAME = 'oauth-state';
    private readonly STATE_COOKIE_MAX_AGE = 10 * 60 * 1000;

    constructor(private readonly configService: ConfigService) {}

    private getIsProduction() {
        return this.configService.get('NODE_ENV') === 'production';
    }

    private generateState() {
        return encodeBase64url(crypto.getRandomValues(new Uint8Array(32)));
    }

    private hashState(state: string) {
        return encodeHexLowerCase(sha256(new TextEncoder().encode(state)));
    }

    setStateCookie(res: Response): string {
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

    validateState(req: Request, state: string): boolean {
        const storedHash = req.signedCookies?.[this.STATE_COOKIE_NAME];
        if (!storedHash || !state) {
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

    getGoogleAuthUrl(state: string): string {
        const clientId = this.configService.get<string>('google.clientId')!;
        const callbackUrl = this.configService.get<string>('google.callbackUrl')!;

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: 'openid email profile',
            state,
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
        const clientId = this.configService.get<string>('google.clientId')!;
        const clientSecret = this.configService.get<string>('google.clientSecret')!;
        const callbackUrl = this.configService.get<string>('google.callbackUrl')!;

        const response = await fetch('https://oauth2.googleapis.com/token', {
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
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
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

    getGitHubAuthUrl(state: string): string {
        const clientId = this.configService.get<string>('github.clientId')!;
        const callbackUrl = this.configService.get<string>('github.callbackUrl')!;

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            scope: 'read:user user:email',
            state,
        });

        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    async exchangeGitHubCode(code: string): Promise<GitHubTokenResponse> {
        const clientId = this.configService.get<string>('github.clientId')!;
        const clientSecret = this.configService.get<string>('github.clientSecret')!;
        const callbackUrl = this.configService.get<string>('github.callbackUrl')!;

        const response = await fetch('https://github.com/login/oauth/access_token', {
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
            fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json',
                },
            }),
            fetch('https://api.github.com/user/emails', {
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
        return res.redirect(`${frontendUrl}/auth/error?error=${encodeURIComponent(error)}`);
    }
}
