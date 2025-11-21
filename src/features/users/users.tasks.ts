import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsersTasksService {
    private readonly logger = new Logger(UsersTasksService.name);

    constructor(private readonly usersService: UsersService) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteSoftDeletedUsers() {
        this.logger.log('Starting soft deleted users cleanup');
        try {
            const deletedCount = await this.usersService.deleteSoftDeletedUsers();
            this.logger.log(`Deleted ${deletedCount} soft deleted users`);
        } catch (error) {
            this.logger.error('Error deleting soft deleted users', error);
        }
    }
}
