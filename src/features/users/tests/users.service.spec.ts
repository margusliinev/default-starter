import { createUserDto, TestModule, updateUserDto } from '../../../common/testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

describe('UsersService', () => {
    let module: TestingModule;
    let usersService: UsersService;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        module = await Test.createTestingModule({ imports: [TestModule] }).compile();
        usersService = module.get(UsersService);
        userRepository = module.get(getRepositoryToken(User));
    });

    afterEach(async () => {
        await userRepository.deleteAll();
    });

    afterAll(async () => {
        await module.close();
    });

    it('createUser persists user to database', async () => {
        const dto = createUserDto();

        const user = await usersService.createUser(dto);

        expect(user).toMatchObject({ name: dto.name, email: dto.email });
        expect(user.id).toBeDefined();
    });

    it('createUser throws for duplicate email', async () => {
        const email = faker.internet.email().toLowerCase();
        await usersService.createUser(createUserDto({ email }));

        await expect(usersService.createUser(createUserDto({ email }))).rejects.toThrow();
    });

    it('findUserById returns user', async () => {
        const user = await usersService.createUser(createUserDto());

        const found = await usersService.findUserById(user.id);

        expect(found).toMatchObject({ id: user.id });
    });

    it('findUserById returns null for non-existent id', async () => {
        const found = await usersService.findUserById(faker.string.uuid());

        expect(found).toBeNull();
    });

    it('findUserByEmail returns user', async () => {
        const dto = createUserDto();
        await usersService.createUser(dto);

        const found = await usersService.findUserByEmail(dto.email);

        expect(found).toMatchObject({ email: dto.email });
    });

    it('findUserByEmail returns null for non-existent email', async () => {
        const found = await usersService.findUserByEmail(faker.internet.email());

        expect(found).toBeNull();
    });

    it('findUserByEmail is case-sensitive', async () => {
        const dto = createUserDto();
        await usersService.createUser(dto);

        const found = await usersService.findUserByEmail(dto.email.toUpperCase());

        expect(found).toBeNull();
    });

    it('updateUser updates fields', async () => {
        const user = await usersService.createUser(createUserDto());
        const updates = updateUserDto();

        const updated = await usersService.updateUser(user.id, updates);

        expect(updated).toMatchObject({ name: updates.name, image: updates.image });
    });

    it('updateUser returns null for non-existent id', async () => {
        const result = await usersService.updateUser(faker.string.uuid(), updateUserDto());

        expect(result).toBeNull();
    });

    it('deleteUser removes user from database', async () => {
        const user = await usersService.createUser(createUserDto());

        await usersService.deleteUser(user.id);

        expect(await userRepository.findOne({ where: { id: user.id } })).toBeNull();
    });

    it('deleteUser does not throw for non-existent id', async () => {
        await expect(usersService.deleteUser(faker.string.uuid())).resolves.not.toThrow();
    });
});
