import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sha256 } from '@oslojs/crypto/sha2';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import type { Request, Response } from 'express';

@Injectable()
export class SessionsService {
    private readonly COOKIE_NAME = 'auth-session';
    private readonly DAY_IN_MS = 24 * 60 * 60 * 1000;
    private readonly SESSION_DURATION_MS = 30 * this.DAY_IN_MS;
    private readonly SESSION_RENEWAL_THRESHOLD_MS = 15 * this.DAY_IN_MS;

    constructor(
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
        private readonly configService: ConfigService,
    ) {}

    private getRepository(manager?: EntityManager) {
        return manager ? manager.getRepository(Session) : this.sessionRepository;
    }
    private getIsProduction() {
        return this.configService.get('NODE_ENV') === 'production';
    }
    private isSessionExpired(session: Session) {
        return Date.now() >= new Date(session.expires_at).getTime();
    }
    private getNewSessionExpirationDate() {
        return new Date(Date.now() + this.SESSION_DURATION_MS);
    }
    private shouldRenewSession(session: Session) {
        return Date.now() >= new Date(session.expires_at).getTime() - this.SESSION_RENEWAL_THRESHOLD_MS;
    }
    private generateToken() {
        return encodeBase64url(crypto.getRandomValues(new Uint8Array(32)));
    }
    private hashToken(token: string) {
        return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    }

    public getSessionTokenFromCookie(req: Request) {
        return req.signedCookies?.[this.COOKIE_NAME];
    }
    public setSessionCookie(res: Response, token: string, expiresAt: Date) {
        res.cookie(this.COOKIE_NAME, token, {
            path: '/',
            httpOnly: true,
            secure: this.getIsProduction(),
            signed: true,
            sameSite: 'lax',
            expires: expiresAt,
        });
    }
    public clearSessionCookie(res: Response) {
        res.clearCookie(this.COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: this.getIsProduction(),
            signed: true,
            sameSite: 'lax',
        });
    }

    async createSession(userId: User['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const plainToken = this.generateToken();
        const hashedToken = this.hashToken(plainToken);

        const session = repo.create({
            token: hashedToken,
            user_id: userId,
            expires_at: this.getNewSessionExpirationDate(),
        });

        await repo.save(session);

        return { token: plainToken, expiresAt: session.expires_at };
    }

    async validateSessionToken(plainToken: Session['token'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const hashedToken = this.hashToken(plainToken);
        const session = await repo.findOne({ where: { token: hashedToken }, relations: ['user'] });
        if (!session) {
            return null;
        }

        const sessionExpired = this.isSessionExpired(session);
        if (sessionExpired) {
            await repo.delete(session.id);
            return null;
        }

        const renewSession = this.shouldRenewSession(session);
        if (renewSession) {
            const expiresAt = this.getNewSessionExpirationDate();
            session.expires_at = expiresAt;

            await repo.update(session.id, { expires_at: expiresAt });
        }

        return session;
    }

    async deleteSessionById(id: Session['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        await repo.delete(id);
    }

    async deleteExpiredSessions(manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const result = await repo.delete({ expires_at: LessThan(new Date()) });

        return result.affected || 0;
    }

    async deleteUserSessions(userId: User['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const result = await repo.delete({ user_id: userId });

        return result.affected || 0;
    }
}
