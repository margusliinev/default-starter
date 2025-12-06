import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../../../common/enums/provider';
import { createUserDto, TestModule } from '../../../common/testing';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { AccountsService } from '../accounts.service';
import { Account } from '../entities/account.entity';

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

    it('should create an account with password', async () => {
        const user = await usersService.createUser(createUserDto());
        const password = 'TestPassword123';

        const account = await accountsService.createAccountWithPassword(user.id, password);

        expect(account).toBeDefined();
        expect(account.id).toBeDefined();
        expect(account.user_id).toBe(user.id);
        expect(account.provider).toBe(Provider.PASSWORD);
        expect(account.password).toBeDefined();
        expect(account.password).not.toBe(password);
        expect(account.provider_id).toBeNull();
    });

    it('should hash the password when creating account', async () => {
        const user = await usersService.createUser(createUserDto());
        const password = 'TestPassword123';

        const account = await accountsService.createAccountWithPassword(user.id, password);

        expect(account.password).not.toBe(password);
        expect(account.password?.length).toBeGreaterThan(password.length);
    });

    it('should find account with password by user id', async () => {
        const user = await usersService.createUser(createUserDto());
        const createdAccount = await accountsService.createAccountWithPassword(user.id, 'TestPassword123');

        const foundAccount = await accountsService.findAccountWithPasswordByUserId(user.id);

        expect(foundAccount).toBeDefined();
        expect(foundAccount?.id).toBe(createdAccount.id);
        expect(foundAccount?.provider).toBe(Provider.PASSWORD);
    });

    it('should return null when finding account with password for non-existent user', async () => {
        const nonExistentUserId = faker.string.uuid();

        const foundAccount = await accountsService.findAccountWithPasswordByUserId(nonExistentUserId);

        expect(foundAccount).toBeNull();
    });

    it('should create an OAuth account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        const account = await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        expect(account).toBeDefined();
        expect(account.id).toBeDefined();
        expect(account.user_id).toBe(user.id);
        expect(account.provider).toBe(Provider.GOOGLE);
        expect(account.provider_id).toBe(providerId);
        expect(account.password).toBeNull();
    });

    it('should create GitHub OAuth account', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);

        const account = await accountsService.createOAuthAccount(user.id, Provider.GITHUB, providerId);

        expect(account.provider).toBe(Provider.GITHUB);
        expect(account.provider_id).toBe(providerId);
    });

    it('should find account by provider id', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        const foundAccount = await accountsService.findAccountByProviderId(Provider.GOOGLE, providerId);

        expect(foundAccount).toBeDefined();
        expect(foundAccount?.provider).toBe(Provider.GOOGLE);
        expect(foundAccount?.provider_id).toBe(providerId);
    });

    it('should return null when finding account by non-existent provider id', async () => {
        const nonExistentProviderId = faker.string.alphanumeric(20);

        const foundAccount = await accountsService.findAccountByProviderId(Provider.GOOGLE, nonExistentProviderId);

        expect(foundAccount).toBeNull();
    });

    it('should not find account with wrong provider', async () => {
        const user = await usersService.createUser(createUserDto());
        const providerId = faker.string.alphanumeric(20);
        await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, providerId);

        const foundAccount = await accountsService.findAccountByProviderId(Provider.GITHUB, providerId);

        expect(foundAccount).toBeNull();
    });

    it('should persist account to database', async () => {
        const user = await usersService.createUser(createUserDto());
        const createdAccount = await accountsService.createAccountWithPassword(user.id, 'TestPassword123');

        const foundAccount = await accountRepository.findOne({ where: { id: createdAccount.id } });

        expect(foundAccount).toBeDefined();
        expect(foundAccount?.id).toBe(createdAccount.id);
    });

    it('should allow multiple accounts for same user with different providers', async () => {
        const user = await usersService.createUser(createUserDto());

        const passwordAccount = await accountsService.createAccountWithPassword(user.id, 'TestPassword123');
        const googleAccount = await accountsService.createOAuthAccount(user.id, Provider.GOOGLE, faker.string.alphanumeric(20));
        const githubAccount = await accountsService.createOAuthAccount(user.id, Provider.GITHUB, faker.string.alphanumeric(20));

        expect(passwordAccount.id).not.toBe(googleAccount.id);
        expect(googleAccount.id).not.toBe(githubAccount.id);

        const accounts = await accountRepository.find({ where: { user_id: user.id } });
        expect(accounts).toHaveLength(3);
    });
});
