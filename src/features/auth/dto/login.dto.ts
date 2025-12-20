import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password is invalid' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
