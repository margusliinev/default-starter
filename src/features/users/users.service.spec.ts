import { TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';
import { createTestModule, getRepository, clearRepositories } from '../../common/testing/setup.testing';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';

describe('UsersService', () => {
    let module: TestingModule;
    let usersService: UsersService;
    let userRepo: Repository<User>;

    const createCreateUserDto = (overrides?: Partial<CreateUserDto>): CreateUserDto => ({
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        ...overrides,
    });

    const createUpdateUserDto = (overrides?: Partial<UpdateUserDto>): UpdateUserDto => ({
        name: 'Updated Name',
        image: 'https://example.com/updated-image.jpg',
        ...overrides,
    });

    beforeEach(async () => {
        module = await createTestModule({ imports: [UsersModule] });
        usersService = module.get<UsersService>(UsersService);
        userRepo = getRepository(module, User);
    });

    afterEach(async () => {
        await clearRepositories(userRepo);
        await module.close();
    });

    describe('findUserById', () => {
        it('should find user by id', async () => {
            const createUserDto = createCreateUserDto();
            const createdUser = await usersService.createUser(createUserDto);

            const result = await usersService.findUserById(createdUser.id);

            expect(result).toBeDefined();
            expect(result?.id).toBe(createdUser.id);
            expect(result?.name).toBe(createUserDto.name);
            expect(result?.email).toBe(createUserDto.email);
        });

        it('should return null when user not found', async () => {
            const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
            const result = await usersService.findUserById(nonExistentUserId);

            expect(result).toBeNull();
        });
    });

    describe('findUserByEmail', () => {
        it('should find user by email', async () => {
            const createUserDto = createCreateUserDto();
            const createdUser = await usersService.createUser(createUserDto);

            const result = await usersService.findUserByEmail(createUserDto.email);

            expect(result).toBeDefined();
            expect(result?.id).toBe(createdUser.id);
            expect(result?.email).toBe(createUserDto.email);
        });

        it('should return null when user not found', async () => {
            const nonExistentEmail = 'nonexistent@example.com';
            const result = await usersService.findUserByEmail(nonExistentEmail);

            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should create user', async () => {
            const createUserDto = createCreateUserDto();

            const result = await usersService.createUser(createUserDto);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(createUserDto.name);
            expect(result.email).toBe(createUserDto.email);
            expect(result.created_at).toBeDefined();
        });
    });

    describe('updateUser', () => {
        it('should update user', async () => {
            const createUserDto = createCreateUserDto();
            const createdUser = await usersService.createUser(createUserDto);
            const updateUserDto = createUpdateUserDto();

            const result = await usersService.updateUser(createdUser.id, updateUserDto);

            expect(result).toBeDefined();
            expect(result?.name).toBe(updateUserDto.name);
            expect(result?.image).toBe(updateUserDto.image);
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            const createUserDto = createCreateUserDto();
            const createdUser = await usersService.createUser(createUserDto);

            await usersService.deleteUser(createdUser.id);

            const deletedUser = await userRepo.findOne({ where: { id: createdUser.id } });
            expect(deletedUser).toBeNull();
        });
    });
});
