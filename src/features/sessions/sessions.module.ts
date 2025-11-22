import { SessionsTasksService } from './sessions.tasks';
import { SessionsService } from './sessions.service';
import { Session } from './entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
    imports: [TypeOrmModule.forFeature([Session])],
    providers: [SessionsService, SessionsTasksService],
    exports: [SessionsService],
})
export class SessionsModule {}
