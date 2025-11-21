import { createTestModule, setupRepository } from '../../common/testing/setup.testing';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;
    let module: TestingModule;

    async function createUser(username = 'testuser', email = 'test@example.com') {
        return await service.create({ username, email, password: 'password123' });
    }

    beforeEach(async () => {
        module = await createTestModule({ imports: [UsersModule] });
        service = module.get<UsersService>(UsersService);

        const setup = setupRepository(module, User);
        repository = setup.repo;
    });

    afterEach(async () => {
        await repository.deleteAll();
        await module.close();
    });

    it('should create a user', async () => {
        const created = await createUser();

        expect(created.id).toBeDefined();
        expect(created.username).toBe('testuser');
        expect(created.email).toBe('test@example.com');
    });

    it('should return all users', async () => {
        await createUser('testuser1', 'test1@example.com');
        await createUser('testuser2', 'test2@example.com');

        const users = await service.findAll();

        expect(users).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
        const users = await service.findAll();

        expect(users).toHaveLength(0);
        expect(users).toEqual([]);
    });

    it('should return a user by id', async () => {
        const created = await createUser();

        const found = await service.findById(created.id);

        expect(found.id).toBe(created.id.toString());
        expect(found.username).toBe('testuser');
        expect(found.email).toBe('test@example.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
        const id = randomUUID();
        await expect(service.findById(id)).rejects.toThrow(NotFoundException);
    });

    it('should update a user', async () => {
        const created = await createUser();

        await service.update(created.id, { username: 'updated', email: 'updated@example.com' });

        const found = await service.findById(created.id);
        expect(found.username).toBe('updated');
        expect(found.email).toBe('updated@example.com');
    });

    it('should remove a user', async () => {
        const created = await createUser();
        await service.remove(created.id);

        await expect(service.findById(created.id)).rejects.toThrow(NotFoundException);
    });

    it('should delete users soft-deleted more than 30 days ago', async () => {
        const user1 = await createUser('active', 'active@example.com');
        const user2 = await createUser('recent', 'recent@example.com');
        const user3 = await createUser('old', 'old@example.com');

        const dayMs = 24 * 60 * 60 * 1000;

        await service.remove(user2.id);
        await repository.update(user2.id, { deleted_at: new Date(Date.now() - dayMs) });

        await repository.update(user3.id, { deleted_at: new Date(Date.now() - 31 * dayMs) });

        const deletedCount = await service.deleteSoftDeletedUsers();

        expect(deletedCount).toBe(1);

        const found1 = await repository.findOne({ where: { id: user1.id }, withDeleted: true });
        expect(found1).toBeDefined();
        expect(found1?.deleted_at).toBeNull();

        const found2 = await repository.findOne({ where: { id: user2.id }, withDeleted: true });
        expect(found2).toBeDefined();
        expect(found2?.deleted_at).not.toBeNull();

        const found3 = await repository.findOne({ where: { id: user3.id }, withDeleted: true });
        expect(found3).toBeNull();
    });
});
