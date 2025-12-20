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
        module = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        accountsService = module.get<AccountsService>(AccountsService);
        usersService = module.get<UsersService>(UsersService);
        accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(async () => {
        await accountRepository.deleteAll();
        await userRepository.deleteAll();
    });

    it('should create a credentials account', async () => {
        const user = await usersService.createUser(createUserDto());
        const password = 'TestPassword123';

        const account = await accountsService.createCredentialsAccount(user.id, password);

        expect(account).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.CREDENTIALS,
            password: expect.any(String),
            provider_id: user.id,
        });
    });

    it('should hash the password when creating credentials account', async () => {
        const user = await usersService.createUser(createUserDto());
        const password = 'TestPassword123';

        const account = await accountsService.createCredentialsAccount(user.id, password);

        expect(account).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.CREDENTIALS,
            password: expect.any(String),
            provider_id: user.id,
        });
        expect(account.password).not.toBe(password);
    });

    it('should find credentials account by user id', async () => {
        const user = await usersService.createUser(createUserDto());
        const createdAccount = await accountsService.createCredentialsAccount(user.id, 'TestPassword123');

        const foundAccount = await accountsService.findCredentialsAccount(user.id);

        expect(foundAccount).toMatchObject({
            id: createdAccount.id,
            user_id: user.id,
            provider: Provider.CREDENTIALS,
            provider_id: user.id,
        });
    });

    it('should return null when finding credentials account for non-existent user', async () => {
        const nonExistentUserId = faker.string.uuid();

        const foundAccount = await accountsService.findCredentialsAccount(nonExistentUserId);

        expect(foundAccount).toBeNull();
    });

    it('should create a Google OAuth account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        const account = await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        expect(account).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.GOOGLE,
            provider_id: providerId,
            password: null,
        });
    });

    it('should create a GitHub OAuth account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        const account = await accountsService.createOAuthAccount(user.id, Provider.GITHUB, providerId);

        expect(account).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.GITHUB,
            provider_id: providerId,
            password: null,
        });
    });

    it('should find OAuth account by provider id', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        const foundAccount = await accountsService.findOAuthAccount(Provider.GOOGLE, providerId);
        expect(foundAccount).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.GOOGLE,
            provider_id: providerId,
            password: null,
        });
    });

    it('should return null when finding OAuth account by non-existent provider id', async () => {
        const nonExistentProviderId = faker.string.alphanumeric(20);

        const foundAccount = await accountsService.findOAuthAccount(Provider.GOOGLE, nonExistentProviderId);

        expect(foundAccount).toBeNull();
    });

    it('should not find OAuth account with wrong provider', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        const foundAccount = await accountsService.findOAuthAccount(Provider.GITHUB, providerId);

        expect(foundAccount).toBeNull();
    });

    it('should persist account to database', async () => {
        const user = await usersService.createUser(createUserDto());
        const createdAccount = await accountsService.createCredentialsAccount(user.id, 'TestPassword123');

        const foundAccount = await accountRepository.findOne({ where: { id: createdAccount.id } });

        expect(foundAccount).toMatchObject({
            id: createdAccount.id,
            user_id: user.id,
            provider: Provider.CREDENTIALS,
            provider_id: user.id,
            password: expect.any(String),
        });
    });

    it('should allow multiple accounts for same user with different providers', async () => {
        const user = await usersService.createUser(createUserDto());

        const credentialsAccount = await accountsService.createCredentialsAccount(user.id, 'TestPassword123');
        const googleAccount = await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, faker.string.alphanumeric(20));
        const githubAccount = await accountsService.createOAuthAccount(user.id, Provider.GITHUB, faker.string.alphanumeric(20));

        expect(credentialsAccount).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.CREDENTIALS,
            provider_id: user.id,
            password: expect.any(String),
        });
        expect(googleAccount).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.GOOGLE,
            provider_id: expect.any(String),
            password: null,
        });
        expect(githubAccount).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            provider: Provider.GITHUB,
            provider_id: expect.any(String),
            password: null,
        });
    });
});
