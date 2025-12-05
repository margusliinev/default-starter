import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from '@node-rs/argon2';
import { ARGON2_OPTIONS } from 'src/common/constants/argon';
import { EntityManager, Repository } from 'typeorm';
import { Provider } from '../../common/enums/provider';
import { User } from '../users/entities/user.entity';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    private getRepository(manager?: EntityManager) {
        return manager ? manager.getRepository(Account) : this.accountRepository;
    }

    async findAccountWithPasswordByUserId(userId: User['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        return await repo.findOne({
            where: { user_id: userId, provider: Provider.PASSWORD },
        });
    }

    async createAccountWithPassword(userId: User['id'], password: string, manager?: EntityManager) {
        const hashedPassword = await hash(password, ARGON2_OPTIONS);

        const repo = this.getRepository(manager);
        const account = repo.create({
            user_id: userId,
            provider: Provider.PASSWORD,
            password: hashedPassword,
        });
        return await repo.save(account);
    }
}
