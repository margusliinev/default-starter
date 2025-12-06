import { createUserDto, TestModule } from '../../../common/testing';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../sessions.service';
import { User } from '../../users/entities/user.entity';
import { Session } from '../entities/session.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

describe('SessionsService', () => {
    let module: TestingModule;
    let sessionsService: SessionsService;
    let usersService: UsersService;
    let sessionRepository: Repository<Session>;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        sessionsService = module.get<SessionsService>(SessionsService);
        usersService = module.get<UsersService>(UsersService);
        sessionRepository = module.get<Repository<Session>>(getRepositoryToken(Session));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(async () => {
        await sessionRepository.deleteAll();
        await userRepository.deleteAll();
    });

    it('should create a session for a user', async () => {
        const user = await usersService.createUser(createUserDto());

        const { token, expiresAt } = await sessionsService.createSession(user.id);

        expect(token).toBeDefined();
        expect(token.length).toBeGreaterThan(0);
        expect(expiresAt).toBeInstanceOf(Date);
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should create session with expiration 30 days in the future', async () => {
        const user = await usersService.createUser(createUserDto());
        const beforeCreate = Date.now();

        const { expiresAt } = await sessionsService.createSession(user.id);

        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const expectedMin = beforeCreate + thirtyDaysMs - 1000;
        const expectedMax = Date.now() + thirtyDaysMs + 1000;

        expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    it('should persist session to database', async () => {
        const user = await usersService.createUser(createUserDto());

        await sessionsService.createSession(user.id);

        const sessions = await sessionRepository.find({ where: { user_id: user.id } });
        expect(sessions).toHaveLength(1);
    });

    it('should validate a valid session token', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);

        const session = await sessionsService.validateSessionToken(token);

        expect(session).toBeDefined();
        expect(session?.user_id).toBe(user.id);
        expect(session?.user).toBeDefined();
        expect(session?.user.id).toBe(user.id);
    });

    it('should return null for invalid session token', async () => {
        const invalidToken = faker.string.alphanumeric(64);

        const session = await sessionsService.validateSessionToken(invalidToken);

        expect(session).toBeNull();
    });

    it('should delete session by id', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);
        const session = await sessionsService.validateSessionToken(token);

        await sessionsService.deleteSessionById(session!.id);

        const deletedSession = await sessionsService.validateSessionToken(token);
        expect(deletedSession).toBeNull();
    });

    it('should not throw when deleting non-existent session', async () => {
        const nonExistentId = faker.string.uuid();

        await expect(sessionsService.deleteSessionById(nonExistentId)).resolves.not.toThrow();
    });

    it('should delete all user sessions', async () => {
        const user = await usersService.createUser(createUserDto());
        await sessionsService.createSession(user.id);
        await sessionsService.createSession(user.id);
        await sessionsService.createSession(user.id);

        const deletedCount = await sessionsService.deleteUserSessions(user.id);

        expect(deletedCount).toBe(3);

        const sessions = await sessionRepository.find({ where: { user_id: user.id } });
        expect(sessions).toHaveLength(0);
    });

    it('should return 0 when deleting sessions for user with no sessions', async () => {
        const user = await usersService.createUser(createUserDto());

        const deletedCount = await sessionsService.deleteUserSessions(user.id);

        expect(deletedCount).toBe(0);
    });

    it('should only delete sessions for specified user', async () => {
        const user1 = await usersService.createUser(createUserDto());
        const user2 = await usersService.createUser(createUserDto());
        await sessionsService.createSession(user1.id);
        await sessionsService.createSession(user1.id);
        const { token: user2Token } = await sessionsService.createSession(user2.id);

        await sessionsService.deleteUserSessions(user1.id);

        const user1Sessions = await sessionRepository.find({ where: { user_id: user1.id } });
        const user2Session = await sessionsService.validateSessionToken(user2Token);

        expect(user1Sessions).toHaveLength(0);
        expect(user2Session).toBeDefined();
    });

    it('should delete expired sessions', async () => {
        const user = await usersService.createUser(createUserDto());
        await sessionsService.createSession(user.id);

        const expiredSession = sessionRepository.create({
            user_id: user.id,
            token: faker.string.alphanumeric(64),
            expires_at: new Date(Date.now() - 1000),
        });
        await sessionRepository.save(expiredSession);

        const deletedCount = await sessionsService.deleteExpiredSessions();

        expect(deletedCount).toBe(1);
    });

    it('should not delete valid sessions when cleaning expired', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);

        await sessionsService.deleteExpiredSessions();

        const session = await sessionsService.validateSessionToken(token);
        expect(session).toBeDefined();
    });

    it('should return null for expired session token', async () => {
        const user = await usersService.createUser(createUserDto());
        const expiredSession = sessionRepository.create({
            user_id: user.id,
            token: faker.string.alphanumeric(64),
            expires_at: new Date(Date.now() - 1000),
        });
        await sessionRepository.save(expiredSession);

        const session = await sessionsService.validateSessionToken(expiredSession.token);

        expect(session).toBeNull();
    });

    it('should create multiple sessions for same user', async () => {
        const user = await usersService.createUser(createUserDto());

        const session1 = await sessionsService.createSession(user.id);
        const session2 = await sessionsService.createSession(user.id);

        expect(session1.token).not.toBe(session2.token);

        const sessions = await sessionRepository.find({ where: { user_id: user.id } });
        expect(sessions).toHaveLength(2);
    });

    it('should generate unique tokens for each session', async () => {
        const user = await usersService.createUser(createUserDto());
        const tokens = new Set<string>();

        for (let i = 0; i < 10; i++) {
            const { token } = await sessionsService.createSession(user.id);
            tokens.add(token);
        }

        expect(tokens.size).toBe(10);
    });
});
