import { IsEmail, IsLowercase, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @MaxLength(255, { message: 'Name must be at most 255 characters' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @IsString({ message: 'Name is invalid' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

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
