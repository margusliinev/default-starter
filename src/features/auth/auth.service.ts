import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly DAY_IN_MS = 24 * 60 * 60 * 1000;
    private readonly SESSION_DURATION_MS = 30 * this.DAY_IN_MS;
    private readonly SESSION_RENEWAL_THRESHOLD_MS = 15 * this.DAY_IN_MS;

    constructor(
        private readonly usersService: UsersService,
        private readonly sessionsService: SessionsService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        const existingUserByUsername = await this.usersService.findByUsername(username);
        if (existingUserByUsername) {
            throw new ConflictException();
        }

        const existingUserByEmail = await this.usersService.findByEmail(email.toLowerCase().trim());
        if (existingUserByEmail) {
            throw new ConflictException();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.usersService.create({
            username,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        return user;
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException();
        }

        return user;
    }

    async logout(sessionId: Session['id']) {
        await this.sessionsService.remove(sessionId);
    }

    async logoutAllDevices(userId: User['id']) {
        await this.sessionsService.deleteUserSessions(userId);
    }

    async createSession(userId: User['id']) {
        const expiresAt = this.getNewSessionExpirationDate();
        return await this.sessionsService.create(userId, { expires_at: expiresAt });
    }

    async validateSession(sessionId: Session['id']) {
        const session = await this.sessionsService.findWithUser(sessionId);
        if (!session) {
            return null;
        }

        const sessionExpired = this.isSessionExpired(session);
        if (sessionExpired) {
            await this.sessionsService.remove(sessionId);
            return null;
        }

        const renewSession = this.shouldRenewSession(session);
        if (renewSession) {
            const expiresAt = this.getNewSessionExpirationDate();
            session.expires_at = expiresAt;
            await this.sessionsService.update(sessionId, { expires_at: expiresAt });
        }

        return session;
    }

    private isSessionExpired(session: Session) {
        return Date.now() >= new Date(session.expires_at).getTime();
    }

    private shouldRenewSession(session: Session) {
        return Date.now() >= new Date(session.expires_at).getTime() - this.SESSION_RENEWAL_THRESHOLD_MS;
    }

    private getNewSessionExpirationDate() {
        return new Date(Date.now() + this.SESSION_DURATION_MS);
    }
}
