import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { SessionsTasksService } from './sessions.tasks';

@Module({
    imports: [TypeOrmModule.forFeature([Session])],
    providers: [SessionsService, SessionsTasksService],
    exports: [SessionsService],
})
export class SessionsModule {}
