import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('Healthcheck')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('healthcheck')
    @Public()
    healthCheck() {
        return this.appService.healthCheck();
    }
}
