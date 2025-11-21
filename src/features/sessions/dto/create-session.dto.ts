import { IsDate, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
    @IsDate({ message: 'Expires at is invalid' })
    @IsNotEmpty({ message: 'Expires at is required' })
    expires_at: Date;
}
