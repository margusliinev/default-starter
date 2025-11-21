import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';

@Module({
    imports: [TerminusModule],
    controllers: [HealthController],
})
export class HealthModule {}
