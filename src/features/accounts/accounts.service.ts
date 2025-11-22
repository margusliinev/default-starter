import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Provider } from '../../common/enums/provider';
import { Account } from './entities/account.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

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
        const hashedPassword = await bcrypt.hash(password, 10);

        const repo = this.getRepository(manager);
        const account = repo.create({
            user_id: userId,
            provider: Provider.PASSWORD,
            password: hashedPassword,
        });
        return await repo.save(account);
    }
}
