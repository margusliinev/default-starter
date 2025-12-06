import { createMockUser, loginDto, registerDto, TestModule } from '../../../common/testing';
import { AccountsService } from '../../accounts/accounts.service';
import { SessionsService } from '../../sessions/sessions.service';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { Account } from '../../accounts/entities/account.entity';
import { Session } from '../../sessions/entities/session.entity';
import { User } from '../../users/entities/user.entity';
import { Provider } from '../../../common/enums/provider';
import { UnauthorizedException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Test } from '@nestjs/testing';

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let accountsService: AccountsService;
    let sessionsService: SessionsService;
    let userRepository: Repository<User>;
    let accountRepository: Repository<Account>;
    let sessionRepository: Repository<Session>;
    let dataSource: DataSource;
    let mockResponse: any;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        authService = module.get(AuthService);
        usersService = module.get(UsersService);
        accountsService = module.get(AccountsService);
        sessionsService = module.get(SessionsService);
        dataSource = module.get(DataSource);
        userRepository = dataSource.getRepository(User);
        accountRepository = dataSource.getRepository(Account);
        sessionRepository = dataSource.getRepository(Session);
    });

    beforeEach(() => {
        mockResponse = {
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };
    });

    afterEach(async () => {
        await sessionRepository.deleteAll();
        await accountRepository.deleteAll();
        await userRepository.deleteAll();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    it('register creates user with account and session', async () => {
        const dto = registerDto();

        const result = await authService.register(dto, mockResponse);

        expect(result).toBe('Registration successful');
        expect(mockResponse.cookie).toHaveBeenCalled();
        const user = await usersService.findUserByEmail(dto.email.toLowerCase());
        expect(user).toBeDefined();
        expect(user!.name).toBe(dto.name);
        const account = await accountsService.findAccountWithPasswordByUserId(user!.id);
        expect(account).toBeDefined();
        expect(account!.provider).toBe('password');
    });

    it('register normalizes email to lowercase', async () => {
        const dto = registerDto({ email: 'TEST@EXAMPLE.COM' });

        await authService.register(dto, mockResponse);

        const user = await usersService.findUserByEmail('test@example.com');
        expect(user).toBeDefined();
        expect(user!.email).toBe('test@example.com');
    });

    it('register throws UnauthorizedException when email already exists', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);

        await expect(authService.register(dto, mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('register sets session cookie', async () => {
        const dto = registerDto();

        await authService.register(dto, mockResponse);

        expect(mockResponse.cookie).toHaveBeenCalledWith(
            'auth-session',
            expect.any(String),
            expect.objectContaining({
                httpOnly: true,
                expires: expect.any(Date),
            }),
        );
    });

    it('login authenticates user with valid credentials', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);
        mockResponse.cookie.mockClear();

        const result = await authService.login(loginDto({ email: dto.email, password: dto.password }), mockResponse);

        expect(result).toBe('Login successful');
        expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('login normalizes email to lowercase', async () => {
        const dto = registerDto({ email: 'user@example.com' });
        await authService.register(dto, mockResponse);
        mockResponse.cookie.mockClear();

        const result = await authService.login(loginDto({ email: 'USER@EXAMPLE.COM', password: dto.password }), mockResponse);

        expect(result).toBe('Login successful');
    });

    it('login throws UnauthorizedException for non-existent user', async () => {
        const dto = loginDto({ email: 'nonexistent@example.com' });

        await expect(authService.login(dto, mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('login throws UnauthorizedException for invalid password', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);

        await expect(authService.login(loginDto({ email: dto.email, password: 'wrongpassword' }), mockResponse)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('login throws UnauthorizedException for OAuth-only user', async () => {
        const user = await usersService.createUser(createMockUser());
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, 'google-id-123');

        await expect(authService.login(loginDto({ email: user.email }), mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('logout deletes session and clears cookie', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);
        const user = await usersService.findUserByEmail(dto.email.toLowerCase());
        const session = await sessionRepository.findOne({ where: { user_id: user!.id } });

        const result = await authService.logout(session!, mockResponse);

        expect(result).toBe('Logout successful');
        expect(mockResponse.clearCookie).toHaveBeenCalledWith('auth-session', expect.any(Object));
        const remainingSession = await sessionRepository.findOne({ where: { user_id: user!.id } });
        expect(remainingSession).toBeNull();
    });

    it('logoutAll deletes all user sessions and clears cookie', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);
        const user = await usersService.findUserByEmail(dto.email.toLowerCase());
        await sessionsService.createSession(user!.id);
        await sessionsService.createSession(user!.id);
        const sessions = await sessionRepository.find({ where: { user_id: user!.id } });
        expect(sessions.length).toBeGreaterThanOrEqual(3);
        const session = sessions[0];

        const result = await authService.logoutAll(session, mockResponse);

        expect(result).toBe('Logout all successful');
        expect(mockResponse.clearCookie).toHaveBeenCalledWith('auth-session', expect.any(Object));
        const remainingSessions = await sessionRepository.find({ where: { user_id: user!.id } });
        expect(remainingSessions).toHaveLength(0);
    });
});
