import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthResponseDto } from './dto/responses';

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
