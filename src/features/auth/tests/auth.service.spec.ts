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
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Response } from 'express';

describe('AuthService', () => {
    let module: TestingModule;
    let authService: AuthService;
    let usersService: UsersService;
    let accountsService: AccountsService;
    let sessionsService: SessionsService;
    let userRepository: Repository<User>;
    let accountRepository: Repository<Account>;
    let sessionRepository: Repository<Session>;
    let mockResponse: Response;

    beforeAll(async () => {
        module = await Test.createTestingModule({ imports: [TestModule] }).compile();
        authService = module.get(AuthService);
        usersService = module.get(UsersService);
        accountsService = module.get(AccountsService);
        sessionsService = module.get(SessionsService);
        userRepository = module.get(getRepositoryToken(User));
        accountRepository = module.get(getRepositoryToken(Account));
        sessionRepository = module.get(getRepositoryToken(Session));
    });

    beforeEach(() => {
        mockResponse = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;
    });

    afterEach(async () => {
        await sessionRepository.deleteAll();
        await accountRepository.deleteAll();
        await userRepository.deleteAll();
    });

    afterAll(async () => {
        await module.close();
    });

    it('register creates user with account', async () => {
        const dto = registerDto();

        await authService.register(dto, mockResponse);

        const user = await usersService.findUserByEmail(dto.email);
        expect(user).toMatchObject({ name: dto.name, email: dto.email });
        const account = await accountsService.findCredentialsAccount(user!.id);
        expect(account).toMatchObject({ provider: Provider.CREDENTIALS });
        expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('register throws UnauthorizedException for duplicate email', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);

        await expect(authService.register(dto, mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('login returns success for valid credentials', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);
        (mockResponse.cookie as jest.Mock).mockClear();

        const result = await authService.login(loginDto({ email: dto.email, password: dto.password }), mockResponse);

        expect(result).toBe('Login successful');
        expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it('login throws UnauthorizedException for non-existent user', async () => {
        await expect(authService.login(loginDto(), mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('login throws UnauthorizedException for invalid password', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);

        await expect(authService.login(loginDto({ email: dto.email, password: 'wrong' }), mockResponse)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('login throws UnauthorizedException for OAuth-only user', async () => {
        const user = await usersService.createUser(createMockUser());
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, 'google-id');

        await expect(authService.login(loginDto({ email: user.email }), mockResponse)).rejects.toThrow(UnauthorizedException);
    });

    it('logout deletes session and clears cookie', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);
        const user = (await usersService.findUserByEmail(dto.email))!;
        const session = (await sessionRepository.findOne({ where: { user_id: user.id } }))!;

        await authService.logout(session, mockResponse);

        expect(await sessionRepository.findOne({ where: { user_id: user.id } })).toBeNull();
        expect(mockResponse.clearCookie).toHaveBeenCalled();
    });

    it('logoutAll deletes all sessions for user', async () => {
        const dto = registerDto();
        await authService.register(dto, mockResponse);
        const user = (await usersService.findUserByEmail(dto.email))!;
        await sessionsService.createSession(user.id);
        await sessionsService.createSession(user.id);
        const session = (await sessionRepository.findOne({ where: { user_id: user.id } }))!;

        await authService.logoutAll(session, mockResponse);

        expect(await sessionRepository.find({ where: { user_id: user.id } })).toHaveLength(0);
        expect(mockResponse.clearCookie).toHaveBeenCalled();
    });
});
