import { createTestModule, setupRepository } from '../../common/testing/setup.testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';
import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let sessionRepository: Repository<Session>;
    let userRepository: Repository<User>;
    let module: TestingModule;

    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const SESSION_DURATION_MS = 30 * DAY_IN_MS;

    async function createUser(username?: string, email?: string, password?: string) {
        return await service.register({
            username: username || 'testuser',
            email: email || 'test@example.com',
            password: password || 'password123',
        });
    }

    beforeEach(async () => {
        module = await createTestModule({ imports: [AuthModule] });
        service = module.get<AuthService>(AuthService);

        const userSetup = setupRepository(module, User);
        userRepository = userSetup.repo;

        const sessionSetup = setupRepository(module, Session);
        sessionRepository = sessionSetup.repo;
    });

    afterEach(async () => {
        await sessionRepository.deleteAll();
        await userRepository.deleteAll();
        await module.close();
    });

    it('should register a new user', async () => {
        const user = await createUser();

        expect(user.id).toBeDefined();
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
        expect(user.password).not.toBe('password123');

        const passwordMatch = await bcrypt.compare('password123', user.password);
        expect(passwordMatch).toBe(true);
    });

    it('should lowercase and trim email', async () => {
        const user = await createUser('testuser', '  TEST@EXAMPLE.COM  ', 'password123');
        expect(user.email).toBe('test@example.com');
    });

    it('should throw ConflictException when username already exists', async () => {
        await createUser('testuser', 'test1@example.com', 'password123');
        await expect(createUser('testuser', 'test2@example.com', 'password123')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when email already exists', async () => {
        await createUser('testuser1', 'test@example.com', 'password123');
        await expect(createUser('testuser2', 'test@example.com', 'password123')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when email already exists (case insensitive)', async () => {
        await createUser('testuser1', 'test@example.com', 'password123');
        await expect(createUser('testuser2', 'TEST@EXAMPLE.COM', 'password123')).rejects.toThrow(ConflictException);
    });

    it('should login with valid credentials', async () => {
        const testUser = await createUser('testuser', 'test@example.com', 'password123');
        const user = await service.login({ email: 'test@example.com', password: 'password123' });

        expect(user.id).toBe(testUser.id);
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
        await createUser('testuser', 'test1@example.com', 'password123');
        await expect(service.login({ email: 'test2@example.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
        await createUser('testuser', 'test@example.com', 'password123');
        await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
    });

    it('should remove session', async () => {
        const user = await createUser('testuser', 'test@example.com', 'password123');
        const session = await service.createSession(user.id);

        await service.logout(session.id);

        const foundSession = await sessionRepository.findOne({ where: { id: session.id } });
        expect(foundSession).toBeNull();
    });

    it('should create a new session for user', async () => {
        const user = await createUser();
        const session = await service.createSession(user.id);

        expect(session).toBeDefined();
        expect(session.id).toBeDefined();
        expect(session.user_id).toBe(user.id);

        const now = Date.now();
        const expiresAt = new Date(session.expires_at).getTime();
        expect(expiresAt - now).toBeLessThanOrEqual(SESSION_DURATION_MS + 1000);
        expect(expiresAt - now).toBeGreaterThanOrEqual(SESSION_DURATION_MS - 1000);
    });

    it('should remove all sessions for the user', async () => {
        const user = await createUser();
        const session1 = await service.createSession(user.id);
        const session2 = await service.createSession(user.id);

        const otherUser = await createUser('other', 'other@example.com');
        const otherSession = await service.createSession(otherUser.id);

        await service.logoutAllDevices(user.id);

        const foundSession1 = await sessionRepository.findOne({ where: { id: session1.id } });
        const foundSession2 = await sessionRepository.findOne({ where: { id: session2.id } });
        const foundOtherSession = await sessionRepository.findOne({ where: { id: otherSession.id } });

        expect(foundSession1).toBeNull();
        expect(foundSession2).toBeNull();
        expect(foundOtherSession).toBeDefined();
    });

    it('should return session if valid', async () => {
        const user = await createUser();
        const session = await service.createSession(user.id);

        const validSession = await service.validateSession(session.id);

        expect(validSession).toBeDefined();
        expect(validSession?.id).toBe(session.id);
        expect(validSession?.user.id).toBe(user.id);
    });

    it('should return null if session does not exist', async () => {
        const nonExistentId = randomUUID();
        const result = await service.validateSession(nonExistentId);
        expect(result).toBeNull();
    });

    it('should return null and delete session if expired', async () => {
        const user = await createUser();
        const session = await service.createSession(user.id);

        const expiredDate = new Date(Date.now() - 1000);
        await sessionRepository.update(session.id, { expires_at: expiredDate });

        const result = await service.validateSession(session.id);

        expect(result).toBeNull();

        const foundSession = await sessionRepository.findOne({ where: { id: session.id } });
        expect(foundSession).toBeNull();
    });

    it('should renew session if within renewal threshold', async () => {
        const user = await createUser();
        const session = await service.createSession(user.id);

        const nearFuture = new Date(Date.now() + 14 * DAY_IN_MS);
        await sessionRepository.update(session.id, { expires_at: nearFuture });

        const result = await service.validateSession(session.id);

        expect(result).toBeDefined();

        const newExpiresAt = new Date(result!.expires_at).getTime();
        const expectedExpiresAt = Date.now() + SESSION_DURATION_MS;

        expect(newExpiresAt).toBeGreaterThan(nearFuture.getTime());
        expect(Math.abs(newExpiresAt - expectedExpiresAt)).toBeLessThan(5000);
    });

    it('should not renew session if not within renewal threshold', async () => {
        const user = await createUser();
        const session = await service.createSession(user.id);

        const farFuture = new Date(Date.now() + 20 * DAY_IN_MS);
        await sessionRepository.update(session.id, { expires_at: farFuture });

        const result = await service.validateSession(session.id);

        expect(result).toBeDefined();
        expect(new Date(result!.expires_at).getTime()).toEqual(farFuture.getTime());
    });
});
