import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Registration successful' })
    data: string;
}
