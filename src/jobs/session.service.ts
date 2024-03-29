import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/modules/drizzle/drizzle.provider';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sessionsTable } from 'src/db/schema';
import { lt } from 'drizzle-orm';

@Injectable()
export class SessionService {
    constructor(@Inject(DATA_SOURCE) private db: DATA_SOURCE_TYPE) {}
    private readonly logger = new Logger(SessionService.name);

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        try {
            await this.db.delete(sessionsTable).where(lt(sessionsTable.expires_at, new Date()));
        } catch (error) {
            this.logger.error(error);
        }
    }
}
