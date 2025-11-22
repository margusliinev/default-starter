import { IsEmail, IsLowercase, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsLowercase({ message: 'Email must be lowercase' })
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password is invalid' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
