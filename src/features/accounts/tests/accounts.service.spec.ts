import { createUserDto, TestModule } from '../../../common/testing';
import { AccountsService } from '../accounts.service';
import { UsersService } from '../../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '../../../common/enums/provider';
import { User } from '../../users/entities/user.entity';
import { Account } from '../entities/account.entity';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

describe('AccountsService', () => {
    let module: TestingModule;
    let accountsService: AccountsService;
    let usersService: UsersService;
    let accountRepository: Repository<Account>;
    let userRepository: Repository<User>;

    beforeAll(async () => {
        module = await Test.createTestingModule({ imports: [TestModule] }).compile();
        accountsService = module.get(AccountsService);
        usersService = module.get(UsersService);
        accountRepository = module.get(getRepositoryToken(Account));
        userRepository = module.get(getRepositoryToken(User));
    });

    afterEach(async () => {
        await accountRepository.deleteAll();
        await userRepository.deleteAll();
    });

    afterAll(async () => {
        await module.close();
    });

    it('createCredentialsAccount creates account with hashed password', async () => {
        const user = await usersService.createUser(createUserDto());
        const password = 'TestPassword123';

        const account = await accountsService.createCredentialsAccount(user.id, password);

        expect(account).toMatchObject({ user_id: user.id, provider: Provider.CREDENTIALS });
        expect(account.password).not.toBe(password);
    });

    it('findCredentialsAccount returns account', async () => {
        const user = await usersService.createUser(createUserDto());
        await accountsService.createCredentialsAccount(user.id, 'TestPassword123');

        const found = await accountsService.findCredentialsAccount(user.id);

        expect(found).toMatchObject({ user_id: user.id, provider: Provider.CREDENTIALS });
    });

    it('findCredentialsAccount returns null for non-existent user', async () => {
        const found = await accountsService.findCredentialsAccount(faker.string.uuid());

        expect(found).toBeNull();
    });

    it('findCredentialsAccount returns credentials account when user has multiple account types', async () => {
        const user = await usersService.createUser(createUserDto());
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, faker.string.alphanumeric(20));
        await accountsService.createCredentialsAccount(user.id, 'TestPassword123');
        await accountsService.createOAuthAccount(user.id, Provider.GITHUB, faker.string.alphanumeric(20));

        const found = await accountsService.findCredentialsAccount(user.id);

        expect(found).toMatchObject({ provider: Provider.CREDENTIALS });
    });

    it('createOAuthAccount creates Google account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        const account = await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        expect(account).toMatchObject({ user_id: user.id, provider: Provider.GOOGLE, provider_id: providerId, password: null });
    });

    it('createOAuthAccount creates GitHub account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        const account = await accountsService.createOAuthAccount(user.id, Provider.GITHUB, providerId);

        expect(account).toMatchObject({ user_id: user.id, provider: Provider.GITHUB, provider_id: providerId });
    });

    it('findOAuthAccount returns account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        const found = await accountsService.findOAuthAccount(Provider.GOOGLE, providerId);

        expect(found).toMatchObject({ provider: Provider.GOOGLE, provider_id: providerId });
    });

    it('findOAuthAccount returns null for non-existent providerId', async () => {
        const found = await accountsService.findOAuthAccount(Provider.GOOGLE, faker.string.alphanumeric(20));

        expect(found).toBeNull();
    });

    it('findOAuthAccount returns null for wrong provider', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        const found = await accountsService.findOAuthAccount(Provider.GITHUB, providerId);

        expect(found).toBeNull();
    });

    it('allows multiple accounts for same user', async () => {
        const user = await usersService.createUser(createUserDto());

        await accountsService.createCredentialsAccount(user.id, 'TestPassword123');
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, faker.string.alphanumeric(20));
        await accountsService.createOAuthAccount(user.id, Provider.GITHUB, faker.string.alphanumeric(20));

        expect(await accountRepository.find({ where: { user_id: user.id } })).toHaveLength(3);
    });
});
