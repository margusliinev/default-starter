import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';

export class UserResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        example: {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'John Doe',
            email: 'johndoe@example.com',
            image: null,
            email_verified_at: null,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
        },
    })
    data: User;
}
