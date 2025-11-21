import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsLowercase } from 'class-validator';

export class RegisterDto {
    @MaxLength(50, { message: 'Username must be at most 50 characters' })
    @MinLength(2, { message: 'Username must be at least 2 characters' })
    @IsString({ message: 'Username is invalid' })
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsLowercase({ message: 'Email must be lowercase' })
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @Matches(/.*[A-Za-z].*/, { message: 'Password must contain at least one letter' })
    @Matches(/.*\d.*/, { message: 'Password must contain at least one number' })
    @MaxLength(255, { message: 'Password must be at most 255 characters' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @IsString({ message: 'Password is invalid' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
