import { SessionsModule } from '../features/sessions/sessions.module';
import { SessionsCron } from './sessions.cron';
import { Module } from '@nestjs/common';

@Module({
    imports: [SessionsModule],
    providers: [SessionsCron],
})
export class CronsModule {}
