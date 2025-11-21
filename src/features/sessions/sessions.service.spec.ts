import { createTestModule, setupRepository } from '../../common/testing/setup.testing';
import { SessionsService } from './sessions.service';
import { SessionsModule } from './sessions.module';
import { Session } from './entities/session.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

describe('SessionsService', () => {
    let sessionRepository: Repository<Session>;
    let userRepository: Repository<User>;
    let sessionService: SessionsService;
    let userService: UsersService;
    let module: TestingModule;

    async function createUser(username = 'testuser', email = 'test@example.com') {
        return await userService.create({ username, email, password: 'password123' });
    }

    beforeEach(async () => {
        module = await createTestModule({ imports: [SessionsModule, UsersModule] });
        sessionService = module.get<SessionsService>(SessionsService);
        userService = module.get<UsersService>(UsersService);

        const sessionSetup = setupRepository(module, Session);
        sessionRepository = sessionSetup.repo;

        const userSetup = setupRepository(module, User);
        userRepository = userSetup.repo;
    });

    afterEach(async () => {
        await sessionRepository.deleteAll();
        await userRepository.deleteAll();
        await module.close();
    });

    it('should return a session with user relation', async () => {
        const user = await createUser();
        const session = await sessionService.create(user.id, { expires_at: new Date(Date.now() + 3600000) });

        const found = await sessionService.findWithUser(session.id);

        expect(found!.id).toBe(session.id);
        expect(found!.user_id).toBe(user.id);
        expect(found!.user).toBeDefined();
        expect(found!.user.id).toBe(user.id);
        expect(found!.user.username).toBe(user.username);
    });

    it('should return null when session does not exist', async () => {
        const id = randomUUID();
        const found = await sessionService.findWithUser(id);

        expect(found).toBeNull();
    });

    it('should create a session', async () => {
        const expiresAt = new Date(Date.now() + 3600000);
        const user = await createUser();
        const session = await sessionService.create(user.id, { expires_at: expiresAt });

        expect(session.id).toBeDefined();
        expect(session.user_id).toBe(user.id);
        expect(session.expires_at).toEqual(expiresAt);
    });

    it('should update a session', async () => {
        const user = await createUser();
        const session = await sessionService.create(user.id, { expires_at: new Date(Date.now() + 3600000) });

        const newExpiresAt = new Date(Date.now() + 7200000);
        await sessionService.update(session.id, { expires_at: newExpiresAt });

        const found = await sessionRepository.findOne({ where: { id: session.id } });
        expect(found).not.toBeNull();
        expect(found!.expires_at).toEqual(newExpiresAt);
    });

    it('should remove a session', async () => {
        const user = await createUser();
        const session = await sessionService.create(user.id, { expires_at: new Date(Date.now() + 3600000) });

        await sessionService.remove(session.id);

        const found = await sessionRepository.findOne({ where: { id: session.id } });
        expect(found).toBeNull();
    });

    it('should delete only expired sessions', async () => {
        const user = await createUser();

        await sessionService.create(user.id, { expires_at: new Date(Date.now() - 10000) });
        const activeSession = await sessionService.create(user.id, { expires_at: new Date(Date.now() + 10000) });

        const deletedCount = await sessionService.deleteExpiredSessions();

        expect(deletedCount).toBe(1);

        const allSessions = await sessionRepository.find();
        expect(allSessions).toHaveLength(1);
        expect(allSessions[0].id).toBe(activeSession.id);
    });

    it('should delete all sessions for a specific user', async () => {
        const user1 = await createUser('user1', 'user1@example.com');
        const user2 = await createUser('user2', 'user2@example.com');

        await sessionService.create(user1.id, { expires_at: new Date(Date.now() + 10000) });
        await sessionService.create(user1.id, { expires_at: new Date(Date.now() + 10000) });

        const user2Session = await sessionService.create(user2.id, { expires_at: new Date(Date.now() + 10000) });

        const deletedCount = await sessionService.deleteUserSessions(user1.id);

        expect(deletedCount).toBe(2);

        const allSessions = await sessionRepository.find();
        expect(allSessions).toHaveLength(1);
        expect(allSessions[0].id).toBe(user2Session.id);
    });
});
