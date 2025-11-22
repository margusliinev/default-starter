import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { AccountsService } from '../accounts/accounts.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Session } from '../sessions/entities/session.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly usersService: UsersService,
        private readonly accountsService: AccountsService,
        private readonly sessionsService: SessionsService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await this.usersService.findUserByEmail(normalizedEmail);
        if (existingUser) {
            throw new ConflictException();
        }

        return await this.dataSource.transaction(async (em) => {
            const savedUser = await this.usersService.createUser({ name, email: normalizedEmail }, em);
            await this.accountsService.createAccountWithPassword(savedUser.id, password, em);

            return await this.sessionsService.createSession(savedUser.id, em);
        });
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException();
        }

        const account = await this.accountsService.findAccountWithPasswordByUserId(user.id);
        if (!account || !account.password) {
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException();
        }

        return await this.sessionsService.createSession(user.id);
    }

    async logout(session: Session) {
        await this.sessionsService.deleteSessionById(session.id);
    }

    async logoutAll(session: Session) {
        await this.sessionsService.deleteUserSessions(session.user_id);
    }
}
