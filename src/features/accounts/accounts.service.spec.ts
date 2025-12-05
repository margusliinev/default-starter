import { TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Provider } from '../../common/enums/provider';
import { clearRepositories, createTestModule, getRepository } from '../../common/testing/setup.testing';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AccountsModule } from './accounts.module';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';

describe('AccountsService', () => {
    let module: TestingModule;
    let accountsService: AccountsService;
    let usersService: UsersService;
    let accountRepo: Repository<Account>;
    let userRepo: Repository<User>;

    beforeEach(async () => {
        module = await createTestModule({ imports: [AccountsModule, UsersModule] });
        accountsService = module.get<AccountsService>(AccountsService);
        usersService = module.get<UsersService>(UsersService);
        accountRepo = getRepository(module, Account);
        userRepo = getRepository(module, User);
    });

    afterEach(async () => {
        await clearRepositories(accountRepo, userRepo);
        await module.close();
    });

    describe('findAccountWithPasswordByUserId', () => {
        it('should find account with password by user id', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const password = 'password123';
            const hashedPassword = await bcrypt.hash(password, 10);
            const account = accountRepo.create({
                user_id: user.id,
                provider: Provider.PASSWORD,
                password: hashedPassword,
            });
            await accountRepo.save(account);

            const result = await accountsService.findAccountWithPasswordByUserId(user.id);

            expect(result).toBeDefined();
            expect(result?.user_id).toBe(user.id);
            expect(result?.provider).toBe(Provider.PASSWORD);
            expect(result?.password).toBe(hashedPassword);
        });
    });

    describe('createAccountWithPassword', () => {
        it('should create account with password', async () => {
            const user = await usersService.createUser({
                name: 'Test User',
                email: 'test@example.com',
            });

            const password = 'password123';
            const result = await accountsService.createAccountWithPassword(user.id, password);

            expect(result).toBeDefined();
            expect(result.user_id).toBe(user.id);
            expect(result.provider).toBe(Provider.PASSWORD);
            expect(result.password).not.toBe(password);

            const passwordValid = await bcrypt.compare(password, result.password!);
            expect(passwordValid).toBe(true);
        });
    });
});
