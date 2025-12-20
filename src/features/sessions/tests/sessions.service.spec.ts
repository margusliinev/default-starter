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
        module = await Test.createTestingModule({ imports: [TestModule] }).compile();
        sessionsService = module.get(SessionsService);
        usersService = module.get(UsersService);
        sessionRepository = module.get(getRepositoryToken(Session));
        userRepository = module.get(getRepositoryToken(User));
    });

    afterEach(async () => {
        await sessionRepository.deleteAll();
        await userRepository.deleteAll();
    });

    afterAll(async () => {
        await module.close();
    });

    it('createSession returns token and expiration', async () => {
        const user = await usersService.createUser(createUserDto());

        const { token, expiresAt } = await sessionsService.createSession(user.id);

        expect(token).toBeDefined();
        expect(expiresAt).toBeInstanceOf(Date);
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('createSession sets expiration 30 days in future', async () => {
        const user = await usersService.createUser(createUserDto());
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        const { expiresAt } = await sessionsService.createSession(user.id);

        expect(expiresAt.getTime()).toBeGreaterThan(Date.now() + thirtyDaysMs - 5000);
        expect(expiresAt.getTime()).toBeLessThan(Date.now() + thirtyDaysMs + 5000);
    });

    it('createSession generates unique tokens', async () => {
        const user = await usersService.createUser(createUserDto());

        const tokens = await Promise.all(Array.from({ length: 5 }, () => sessionsService.createSession(user.id).then((s) => s.token)));

        expect(new Set(tokens).size).toBe(5);
    });

    it('validateSessionToken returns session with user', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);

        const session = await sessionsService.validateSessionToken(token);

        expect(session).toMatchObject({ user_id: user.id });
        expect(session?.user.id).toBe(user.id);
    });

    it('validateSessionToken returns null for invalid token', async () => {
        const session = await sessionsService.validateSessionToken(faker.string.alphanumeric(64));

        expect(session).toBeNull();
    });

    it('validateSessionToken returns null and deletes expired session', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);
        const session = (await sessionsService.validateSessionToken(token))!;
        await sessionRepository.update(session.id, { expires_at: new Date(Date.now() - 1000) });

        const result = await sessionsService.validateSessionToken(token);

        expect(result).toBeNull();
        expect(await sessionRepository.findOne({ where: { id: session.id } })).toBeNull();
    });

    it('validateSessionToken renews session within 15 days of expiry', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);
        const session = (await sessionsService.validateSessionToken(token))!;
        const nearExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await sessionRepository.update(session.id, { expires_at: nearExpiry });

        const renewed = await sessionsService.validateSessionToken(token);

        expect(renewed!.expires_at.getTime()).toBeGreaterThan(nearExpiry.getTime());
    });

    it('deleteSessionById removes session', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token } = await sessionsService.createSession(user.id);
        const session = (await sessionsService.validateSessionToken(token))!;

        await sessionsService.deleteSessionById(session.id);

        expect(await sessionsService.validateSessionToken(token)).toBeNull();
    });

    it('deleteSessionById does not throw for non-existent id', async () => {
        await expect(sessionsService.deleteSessionById(faker.string.uuid())).resolves.not.toThrow();
    });

    it('deleteUserSessions removes all sessions for user', async () => {
        const user = await usersService.createUser(createUserDto());
        await sessionsService.createSession(user.id);
        await sessionsService.createSession(user.id);
        await sessionsService.createSession(user.id);

        const deletedCount = await sessionsService.deleteUserSessions(user.id);

        expect(deletedCount).toBe(3);
        expect(await sessionRepository.find({ where: { user_id: user.id } })).toHaveLength(0);
    });

    it('deleteUserSessions only affects specified user', async () => {
        const user1 = await usersService.createUser(createUserDto());
        const user2 = await usersService.createUser(createUserDto());
        await sessionsService.createSession(user1.id);
        const { token: user2Token } = await sessionsService.createSession(user2.id);

        await sessionsService.deleteUserSessions(user1.id);

        expect(await sessionsService.validateSessionToken(user2Token)).toBeDefined();
    });

    it('deleteExpiredSessions removes only expired sessions', async () => {
        const user = await usersService.createUser(createUserDto());
        const { token: validToken } = await sessionsService.createSession(user.id);
        await sessionRepository.save(
            sessionRepository.create({ user_id: user.id, token: faker.string.alphanumeric(64), expires_at: new Date(Date.now() - 1000) }),
        );

        const deletedCount = await sessionsService.deleteExpiredSessions();

        expect(deletedCount).toBe(1);
        expect(await sessionsService.validateSessionToken(validToken)).toBeDefined();
    });
});
