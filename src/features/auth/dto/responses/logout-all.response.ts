import { ApiProperty } from '@nestjs/swagger';

export class LogoutAllResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Logout all successful' })
    data: string;
}
