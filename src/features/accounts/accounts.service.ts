import { ARGON2_OPTIONS } from '../../common/constants/argon';
import { Provider } from '../../common/enums/provider';
import { User } from '../users/entities/user.entity';
import { Account } from './entities/account.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { hash } from '@node-rs/argon2';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    private getRepository(manager?: EntityManager) {
        return manager ? manager.getRepository(Account) : this.accountRepository;
    }

    async findCredentialsAccount(userId: User['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        return await repo.findOne({ where: { provider: Provider.CREDENTIALS, provider_id: userId } });
    }

    async createCredentialsAccount(userId: User['id'], password: string, manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const hashedPassword = await hash(password, ARGON2_OPTIONS);
        const account = repo.create({
            user_id: userId,
            provider: Provider.CREDENTIALS,
            provider_id: userId,
            password: hashedPassword,
        });
        return await repo.save(account);
    }

    async findOAuthAccount(provider: Provider, providerId: string, manager?: EntityManager) {
        const repo = this.getRepository(manager);
        return await repo.findOne({ where: { provider, provider_id: providerId } });
    }

    async createOAuthAccount(userId: User['id'], provider: Provider, providerId: string, manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const account = repo.create({
            user_id: userId,
            provider,
            provider_id: providerId,
        });
        return await repo.save(account);
    }
}
