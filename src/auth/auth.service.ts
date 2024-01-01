import { ConflictException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/drizzle/drizzle.provider';
import { User, usersTable, sessionsTable } from 'src/drizzle/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(@Inject(DATA_SOURCE) private db: DATA_SOURCE_TYPE) {}

    private readonly SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7;

    private async createSession(userId: User['id']) {
        const [session] = await this.db
            .insert(sessionsTable)
            .values({
                user_id: userId,
                expires_at: new Date(Date.now() + this.SESSION_EXPIRATION_TIME),
            })
            .returning();
        if (!session) throw new InternalServerErrorException('Failed to create new session');

        return session;
    }

    async register(registerDto: RegisterDto) {
        const existingUsername = await this.db.query.usersTable.findFirst({ where: eq(usersTable.username, registerDto.username.toLowerCase()) });
        if (existingUsername) throw new ConflictException('Username is already in use');

        const existingEmail = await this.db.query.usersTable.findFirst({ where: eq(usersTable.email, registerDto.email.toLowerCase()) });
        if (existingEmail) throw new ConflictException('Email is already in use');

        const hash = await bcrypt.hash(registerDto.password, 10);

        const [user] = await this.db
            .insert(usersTable)
            .values({ ...registerDto, password: hash })
            .returning();
        if (!user) throw new InternalServerErrorException('Failed to create new user');

        const session = await this.createSession(user.id);

        return { session };
    }

    async login(loginDto: LoginDto) {
        const user = await this.db.query.usersTable.findFirst({ where: eq(usersTable.email, loginDto.email.toLowerCase()) });
        if (!user) throw new UnauthorizedException('Unauthorized');

        const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Unauthorized');

        const session = await this.createSession(user.id);

        return { session };
    }

    async revoke(userId: string) {
        try {
            await this.db.delete(sessionsTable).where(eq(sessionsTable.user_id, userId));
        } catch (error) {
            throw new InternalServerErrorException('Failed to revoke sessions');
        }
        return null;
    }
}
