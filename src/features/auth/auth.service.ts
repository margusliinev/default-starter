import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { Session } from '../sessions/entities/session.entity';
import { ARGON2_OPTIONS } from 'src/common/constants/argon';
import { Provider } from 'src/common/enums/provider';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { verify } from '@node-rs/argon2';
import { DataSource } from 'typeorm';
import type { OAuthUserInfo } from './oauth.types';
import type { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly accountsService: AccountsService,
        private readonly sessionsService: SessionsService,
    ) {}

    async register(registerDto: RegisterDto, res: Response) {
        const { name, email, password } = registerDto;

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await this.usersService.findUserByEmail(normalizedEmail);
        if (existingUser) {
            throw new UnauthorizedException();
        }

        const { token, expiresAt } = await this.dataSource.transaction(async (em) => {
            const savedUser = await this.usersService.createUser({ name, email: normalizedEmail }, em);
            await this.accountsService.createAccountWithPassword(savedUser.id, password, em);
            return await this.sessionsService.createSession(savedUser.id, em);
        });

        this.sessionsService.setSessionCookie(res, token, expiresAt);
        return 'Registration successful';
    }

    async login(loginDto: LoginDto, res: Response) {
        const { email, password } = loginDto;

        const normalizedEmail = email.toLowerCase().trim();
        const user = await this.usersService.findUserByEmail(normalizedEmail);
        if (!user) {
            throw new UnauthorizedException();
        }

        const account = await this.accountsService.findAccountWithPasswordByUserId(user.id);
        if (!account || !account.password) {
            throw new UnauthorizedException();
        }

        const isPasswordValid = await verify(account.password, password, ARGON2_OPTIONS);
        if (!isPasswordValid) {
            throw new UnauthorizedException();
        }

        const { token, expiresAt } = await this.sessionsService.createSession(user.id);
        this.sessionsService.setSessionCookie(res, token, expiresAt);
        return 'Login successful';
    }

    async logout(session: Session, res: Response) {
        await this.sessionsService.deleteSessionById(session.id);
        this.sessionsService.clearSessionCookie(res);
        return 'Logout successful';
    }

    async logoutAll(session: Session, res: Response) {
        await this.sessionsService.deleteUserSessions(session.user_id);
        this.sessionsService.clearSessionCookie(res);
        return 'Logout all successful';
    }

    async handleOAuthCallback(provider: Provider, userInfo: OAuthUserInfo, res: Response) {
        const frontendUrl = this.configService.get<string>('frontendUrl')!;
        const normalizedEmail = userInfo.email.toLowerCase().trim();

        const existingAccount = await this.accountsService.findAccountByProviderId(provider, userInfo.id);
        if (existingAccount) {
            const { token, expiresAt } = await this.sessionsService.createSession(existingAccount.user_id);
            this.sessionsService.setSessionCookie(res, token, expiresAt);
            return res.redirect(frontendUrl);
        }

        const existingUser = await this.usersService.findUserByEmail(normalizedEmail);
        if (existingUser) {
            await this.accountsService.createOAuthAccount(existingUser.id, provider, userInfo.id);

            if (!existingUser.image && userInfo.image) {
                await this.usersService.updateUser(existingUser.id, { image: userInfo.image });
            }

            const { token, expiresAt } = await this.sessionsService.createSession(existingUser.id);
            this.sessionsService.setSessionCookie(res, token, expiresAt);
            return res.redirect(frontendUrl);
        }

        const { token, expiresAt } = await this.dataSource.transaction(async (em) => {
            const newUser = await this.usersService.createUser(
                {
                    name: userInfo.name,
                    email: normalizedEmail,
                    image: userInfo.image,
                    email_verified_at: new Date(),
                },
                em,
            );
            await this.accountsService.createOAuthAccount(newUser.id, provider, userInfo.id, em);
            return await this.sessionsService.createSession(newUser.id, em);
        });

        this.sessionsService.setSessionCookie(res, token, expiresAt);
        return res.redirect(frontendUrl);
    }
}
