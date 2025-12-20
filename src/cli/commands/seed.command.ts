import { AccountsService } from '../../features/accounts/accounts.service';
import { SessionsService } from '../../features/sessions/sessions.service';
import { UsersService } from '../../features/users/users.service';
import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Command({
    name: 'db:seed',
    description: 'Seed the database with a test user',
})
export class SeedCommand extends CommandRunner {
    private readonly logger = new Logger(SeedCommand.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly usersService: UsersService,
        private readonly accountsService: AccountsService,
        private readonly sessionsService: SessionsService,
    ) {
        super();
    }

    async run() {
        this.logger.log('Database seeding started!');
        this.logger.log('========================================');

        await this.dataSource.transaction(async (manager) => {
            const existingUser = await this.usersService.findUserByEmail('test@example.com', manager);
            if (existingUser) {
                this.logger.warn('Test user already exists, skipping seed');
                return;
            }

            const user = await this.usersService.createUser(
                {
                    name: 'Test User',
                    email: 'test@example.com',
                    email_verified_at: new Date(),
                },
                manager,
            );
            this.logger.log('Created user');

            await this.accountsService.createCredentialsAccount(user.id, 'password', manager);
            this.logger.log('Created account');

            const { token, expiresAt } = await this.sessionsService.createSession(user.id, manager);
            this.logger.log('Created session');

            this.logger.log('========================================');
            this.logger.log('Name :    Test User');
            this.logger.log('Email:    test@example.com');
            this.logger.log('Password: password');
            this.logger.log(`Session:  ${token}`);
            this.logger.log(`Expires:  ${expiresAt.toISOString()}`);
            this.logger.log('========================================');
        });

        this.logger.log('Database seeding completed!');
    }
}
