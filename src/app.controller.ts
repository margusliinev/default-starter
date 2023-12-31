import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Healthcheck')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('healthcheck')
    healthCheck() {
        return this.appService.healthCheck();
    }
}
