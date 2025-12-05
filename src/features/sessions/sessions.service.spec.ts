import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { clearRepositories, createTestModule, getRepository } from '../../common/testing/setup.testing';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { Session } from './entities/session.entity';
import { SessionsModule } from './sessions.module';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
    let module: TestingModule;
    let usersService: UsersService;
    let sessionsService: SessionsService;
    let userRepo: Repository<User>;
    let sessionRepo: Repository<Session>;

    beforeEach(async () => {
        module = await createTestModule({ imports: [SessionsModule, UsersModule] });
        usersService = module.get<UsersService>(UsersService);
        sessionsService = module.get<SessionsService>(SessionsService);
        userRepo = getRepository(module, User);
        sessionRepo = getRepository(module, Session);
    });

    afterEach(async () => {
        await clearRepositories(sessionRepo, userRepo);
        await module.close();
    });

    describe('createSession', () => {
        it('should create session', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const result = await sessionsService.createSession(user.id);

            expect(result.token).toBeDefined();
            expect(result.expiresAt).toBeDefined();
            expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());

            const savedSession = await sessionRepo.findOne({
                where: { user_id: user.id },
            });

            expect(savedSession).toBeDefined();
            expect(savedSession?.user_id).toBe(user.id);
            expect(savedSession?.token).toBeDefined();
        });
    });

    describe('validateSessionToken', () => {
        it('should validate and return session when valid', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const { token } = await sessionsService.createSession(user.id);
            const result = await sessionsService.validateSessionToken(token);

            expect(result).toBeDefined();
            expect(result?.user_id).toBe(user.id);
        });

        it('should return null when session not found', async () => {
            const result = await sessionsService.validateSessionToken('invalid-token');

            expect(result).toBeNull();
        });

        it('should delete and return null when session expired', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const { token } = await sessionsService.createSession(user.id);
            const session = await sessionRepo.findOne({
                where: { user_id: user.id },
            });

            session!.expires_at = new Date(Date.now() - 1000);
            await sessionRepo.save(session!);

            const result = await sessionsService.validateSessionToken(token);

            expect(result).toBeNull();

            const deletedSession = await sessionRepo.findOne({ where: { id: session!.id } });
            expect(deletedSession).toBeNull();
        });

        it('should renew session when near expiration', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const { token } = await sessionsService.createSession(user.id);
            const session = await sessionRepo.findOne({
                where: { user_id: user.id },
            });

            session!.expires_at = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
            await sessionRepo.save(session!);

            const originalExpiresAt = session!.expires_at;
            const result = await sessionsService.validateSessionToken(token);

            expect(result).toBeDefined();
            const updatedSession = await sessionRepo.findOne({ where: { id: session!.id } });
            expect(updatedSession?.expires_at.getTime()).toBeGreaterThan(originalExpiresAt.getTime());
        });
    });

    describe('deleteSessionById', () => {
        it('should delete session by id', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            await sessionsService.createSession(user.id);
            const session = await sessionRepo.findOne({
                where: { user_id: user.id },
            });

            await sessionsService.deleteSessionById(session!.id);

            const deletedSession = await sessionRepo.findOne({ where: { id: session!.id } });
            expect(deletedSession).toBeNull();
        });
    });

    describe('deleteExpiredSessions', () => {
        it('should delete expired sessions', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            await sessionsService.createSession(user.id);
            const session = await sessionRepo.findOne({
                where: { user_id: user.id },
            });

            session!.expires_at = new Date(Date.now() - 1000);
            await sessionRepo.save(session!);

            const result = await sessionsService.deleteExpiredSessions();
            expect(result).toBeGreaterThan(0);

            const deletedSession = await sessionRepo.findOne({ where: { id: session!.id } });
            expect(deletedSession).toBeNull();
        });

        it('should return 0 when no sessions deleted', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            await sessionsService.createSession(user.id);

            const result = await sessionsService.deleteExpiredSessions();
            expect(result).toBe(0);
        });
    });

    describe('deleteUserSessions', () => {
        it('should delete all user sessions', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            await sessionsService.createSession(user.id);
            await sessionsService.createSession(user.id);

            const result = await sessionsService.deleteUserSessions(user.id);
            expect(result).toBe(2);

            const sessions = await sessionRepo.find({ where: { user_id: user.id } });
            expect(sessions.length).toBe(0);
        });

        it('should return 0 when no sessions deleted', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const result = await sessionsService.deleteUserSessions(user.id);

            expect(result).toBe(0);
        });
    });
});
