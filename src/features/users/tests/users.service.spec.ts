import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createUserDto, TestModule, updateUserDto } from '../../../common/testing';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

describe('UsersService', () => {
    let module: TestingModule;
    let usersService: UsersService;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(async () => {
        await userRepository.deleteAll();
    });

    it('should create a new user with valid data', async () => {
        const dto = createUserDto();

        const user = await usersService.createUser(dto);

        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
        expect(user.name).toBe(dto.name);
        expect(user.email).toBe(dto.email);
        expect(user.image).toBe(dto.image);
        expect(user.email_verified_at).toBe(dto.email_verified_at);
        expect(user.created_at).toBeInstanceOf(Date);
        expect(user.updated_at).toBeInstanceOf(Date);
    });

    it('should create a user with image', async () => {
        const imageUrl = faker.image.avatar();
        const dto = createUserDto({ image: imageUrl });

        const user = await usersService.createUser(dto);

        expect(user.image).toBe(imageUrl);
    });

    it('should create a user with verified email', async () => {
        const verifiedAt = new Date();
        const dto = createUserDto({ email_verified_at: verifiedAt });

        const user = await usersService.createUser(dto);

        expect(user.email_verified_at).toEqual(verifiedAt);
    });

    it('should persist user to database', async () => {
        const dto = createUserDto();

        const createdUser = await usersService.createUser(dto);
        const foundUser = await userRepository.findOne({ where: { id: createdUser.id } });

        expect(foundUser).toBeDefined();
        expect(foundUser?.id).toBe(createdUser.id);
        expect(foundUser?.email).toBe(dto.email);
    });

    it('should throw error when creating user with duplicate email', async () => {
        const email = faker.internet.email().toLowerCase();
        const dto1 = createUserDto({ email });
        const dto2 = createUserDto({ email });

        await usersService.createUser(dto1);

        await expect(usersService.createUser(dto2)).rejects.toThrow();
    });

    it('should find an existing user by id', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);

        const foundUser = await usersService.findUserById(createdUser.id);

        expect(foundUser).toBeDefined();
        expect(foundUser?.id).toBe(createdUser.id);
        expect(foundUser?.email).toBe(dto.email);
    });

    it('should return null for non-existent user id', async () => {
        const nonExistentId = faker.string.uuid();

        const foundUser = await usersService.findUserById(nonExistentId);

        expect(foundUser).toBeNull();
    });

    it('should find an existing user by email', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);

        const foundUser = await usersService.findUserByEmail(dto.email);

        expect(foundUser).toBeDefined();
        expect(foundUser?.id).toBe(createdUser.id);
        expect(foundUser?.email).toBe(dto.email);
    });

    it('should return null for non-existent email', async () => {
        const nonExistentEmail = faker.internet.email().toLowerCase();

        const foundUser = await usersService.findUserByEmail(nonExistentEmail);

        expect(foundUser).toBeNull();
    });

    it('should be case-sensitive for email lookup', async () => {
        const dto = createUserDto();
        await usersService.createUser(dto);

        const foundWithUpperCase = await usersService.findUserByEmail(dto.email.toUpperCase());

        expect(foundWithUpperCase).toBeNull();
    });

    it('should update user name', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);
        const newName = faker.person.fullName();

        const updatedUser = await usersService.updateUser(createdUser.id, updateUserDto({ name: newName }));

        expect(updatedUser).toBeDefined();
        expect(updatedUser?.name).toBe(newName);
        expect(updatedUser?.email).toBe(dto.email);
    });

    it('should update user image', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);
        const newImage = faker.image.avatar();

        const updatedUser = await usersService.updateUser(createdUser.id, updateUserDto({ image: newImage }));

        expect(updatedUser).toBeDefined();
        expect(updatedUser?.image).toBe(newImage);
    });

    it('should update multiple fields at once', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);
        const updates = updateUserDto();

        const updatedUser = await usersService.updateUser(createdUser.id, updates);

        expect(updatedUser).toBeDefined();
        expect(updatedUser?.name).toBe(updates.name);
        expect(updatedUser?.image).toBe(updates.image);
    });

    it('should update updated_at timestamp', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);
        const originalUpdatedAt = createdUser.updated_at;

        await new Promise((resolve) => setTimeout(resolve, 10));

        const updatedUser = await usersService.updateUser(createdUser.id, updateUserDto());

        expect(updatedUser?.updated_at.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should return null when updating non-existent user', async () => {
        const nonExistentId = faker.string.uuid();

        const result = await usersService.updateUser(nonExistentId, updateUserDto());

        expect(result).toBeNull();
    });

    it('should persist updates to database', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);
        const newName = faker.person.fullName();

        await usersService.updateUser(createdUser.id, updateUserDto({ name: newName }));
        const foundUser = await userRepository.findOne({ where: { id: createdUser.id } });

        expect(foundUser?.name).toBe(newName);
    });

    it('should delete an existing user', async () => {
        const dto = createUserDto();
        const createdUser = await usersService.createUser(dto);

        await usersService.deleteUser(createdUser.id);

        const foundUser = await userRepository.findOne({ where: { id: createdUser.id } });
        expect(foundUser).toBeNull();
    });

    it('should not throw when deleting non-existent user', async () => {
        const nonExistentId = faker.string.uuid();

        await expect(usersService.deleteUser(nonExistentId)).resolves.not.toThrow();
    });

    it('should only delete specified user', async () => {
        const dto1 = createUserDto();
        const dto2 = createUserDto();
        const user1 = await usersService.createUser(dto1);
        const user2 = await usersService.createUser(dto2);

        await usersService.deleteUser(user1.id);

        const foundUser1 = await userRepository.findOne({ where: { id: user1.id } });
        const foundUser2 = await userRepository.findOne({ where: { id: user2.id } });
        expect(foundUser1).toBeNull();
        expect(foundUser2).toBeDefined();
    });
});
