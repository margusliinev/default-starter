import { UnauthorizedException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { clearRepositories, createTestModule, getRepository } from '../../common/testing/setup.testing';
import { Account } from '../accounts/entities/account.entity';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
    let module: TestingModule;
    let authService: AuthService;
    let userRepo: Repository<User>;
    let accountRepo: Repository<Account>;
    let sessionRepo: Repository<Session>;

    const createRegisterDto = (overrides?: Partial<RegisterDto>): RegisterDto => ({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        ...overrides,
    });

    beforeEach(async () => {
        module = await createTestModule({ imports: [AuthModule] });
        authService = module.get<AuthService>(AuthService);
        userRepo = getRepository(module, User);
        accountRepo = getRepository(module, Account);
        sessionRepo = getRepository(module, Session);
    });

    afterEach(async () => {
        await clearRepositories(sessionRepo, accountRepo, userRepo);
        await module.close();
    });

    describe('register', () => {
        it('should register new user successfully', async () => {
            const registerDto = createRegisterDto();

            const result = await authService.register(registerDto);

            expect(result.token).toBeDefined();
            expect(result.expiresAt).toBeDefined();
        });

        it('should throw ConflictException when email already exists', async () => {
            const registerDto = createRegisterDto();

            await authService.register(registerDto);

            await expect(authService.register(registerDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should normalize email to lowercase and trim', async () => {
            const registerDto = createRegisterDto({ email: '  TEST@EXAMPLE.COM  ' });
            await authService.register(registerDto);

            const user = await userRepo.findOne({ where: { email: 'test@example.com' } });

            expect(user).toBeDefined();
            expect(user!.email).toBe('test@example.com');
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const registerDto = createRegisterDto();

            await authService.register(registerDto);

            const result = await authService.login({ email: registerDto.email, password: registerDto.password });

            expect(result.token).toBeDefined();
            expect(result.expiresAt).toBeDefined();
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const loginDto: LoginDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when account not found', async () => {
            const user = await userRepo.save(userRepo.create({ name: 'Test User', email: 'test@example.com' }));

            await expect(authService.login({ email: user.email, password: 'password123' })).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            const registerDto = createRegisterDto();

            await authService.register(registerDto);

            await expect(authService.login({ email: registerDto.email, password: 'wrong-password' })).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('should logout user by deleting session', async () => {
            const registerDto = createRegisterDto();

            await authService.register(registerDto);

            const user = await userRepo.findOne({ where: { email: registerDto.email.toLowerCase().trim() } });
            const session = await sessionRepo.findOne({ where: { user_id: user!.id } });

            await authService.logout(session!);

            const deletedSession = await sessionRepo.findOne({ where: { id: session!.id } });
            expect(deletedSession).toBeNull();
        });
    });

    describe('logoutAll', () => {
        it('should logout user from all sessions', async () => {
            const registerDto = createRegisterDto();

            await authService.register(registerDto);
            await authService.login({
                email: registerDto.email,
                password: registerDto.password,
            });

            const user = await userRepo.findOne({ where: { email: registerDto.email.toLowerCase().trim() } });
            const sessionsBefore = await sessionRepo.find({ where: { user_id: user!.id } });

            expect(sessionsBefore.length).toBe(2);

            await authService.logoutAll(sessionsBefore[0]);

            const sessionsAfter = await sessionRepo.find({ where: { user_id: user!.id } });
            expect(sessionsAfter.length).toBe(0);
        });
    });
});
