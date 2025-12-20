import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { Session } from '../sessions/entities/session.entity';
import { ARGON2_OPTIONS } from '../../common/constants/argon';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { verify } from '@node-rs/argon2';
import { DataSource } from 'typeorm';
import type { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly usersService: UsersService,
        private readonly accountsService: AccountsService,
        private readonly sessionsService: SessionsService,
    ) {}

    async register(registerDto: RegisterDto, res: Response) {
        const { name, email, password } = registerDto;

        const existingUser = await this.usersService.findUserByEmail(email);
        if (existingUser) throw new UnauthorizedException();

        const { token, expiresAt } = await this.dataSource.transaction(async (em) => {
            const savedUser = await this.usersService.createUser({ name, email }, em);
            await this.accountsService.createCredentialsAccount(savedUser.id, password, em);
            return await this.sessionsService.createSession(savedUser.id, em);
        });

        this.sessionsService.setSessionCookie(res, token, expiresAt);
        return 'Register successful';
    }

    async login(loginDto: LoginDto, res: Response) {
        const { email, password } = loginDto;

        const user = await this.usersService.findUserByEmail(email);
        if (!user) throw new UnauthorizedException();

        const account = await this.accountsService.findCredentialsAccount(user.id);
        if (!account || !account.password) throw new UnauthorizedException();

        const isPasswordValid = await verify(account.password, password, ARGON2_OPTIONS);
        if (!isPasswordValid) throw new UnauthorizedException();

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
}
