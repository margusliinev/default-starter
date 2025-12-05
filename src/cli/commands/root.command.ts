import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

@Command({
    name: 'cli',
    description: 'Default Starter CLI',
    options: { isDefault: true },
})
export class RootCommand extends CommandRunner {
    private readonly logger = new Logger(RootCommand.name);

    constructor() {
        super();
    }

    async run(): Promise<void> {
        this.logger.log('Default Starter CLI');
        this.logger.log('');
        this.logger.log('Available commands:');
        this.logger.log('db:seed - Seed the database with a test user');
        this.logger.log('');
        this.logger.log('Usage:');
        this.logger.log('npm run cli <command>');
        this.logger.log('');
        this.logger.log('Example:');
        this.logger.log('npm run cli db:seed');

        return Promise.resolve();
    }
}
