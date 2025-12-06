import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'OK' })
    data: string;
}
