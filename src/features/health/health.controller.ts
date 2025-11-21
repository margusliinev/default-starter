import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Public()
    @Get()
    @HealthCheck()
    @HttpCode(HttpStatus.OK)
    check() {
        return this.health.check([() => this.db.pingCheck('database')]);
    }
}
