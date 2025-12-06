import { Module } from '@nestjs/common';
import { SessionsModule } from '../features/sessions/sessions.module';
import { SessionsCron } from './sessions.cron';

@Module({
    imports: [SessionsModule],
    providers: [SessionsCron],
})
export class CronsModule {}
