import { Public } from '../../common/decorators/public.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/responses';
import { Controller, Get } from '@nestjs/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Public()
    @Get()
    @ApiOkResponse({ type: HealthResponseDto, description: 'Perform a health check' })
    check(): string {
        return 'OK';
    }
}
