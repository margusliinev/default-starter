import { SessionsService } from '../features/sessions/sessions.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SessionsCron {
    private readonly logger = new Logger(SessionsCron.name);

    constructor(private readonly sessionsService: SessionsService) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpiredSessions() {
        this.logger.log('Starting expired sessions cleanup');
        try {
            const deletedCount = await this.sessionsService.deleteExpiredSessions();
            this.logger.log(`Deleted ${deletedCount} expired sessions`);
        } catch (error) {
            this.logger.error('Error deleting expired sessions', error);
        }
    }
}
