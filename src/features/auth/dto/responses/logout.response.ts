import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Logout successful' })
    data: string;
}
