import { IsNotEmpty, IsString, IsEmail, Length, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
    @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters (A-Z), numbers (0-9), and hyphens (-)' })
    @Matches(/^[^-].*[^-]$/, { message: 'Username cannot start or end with a hyphen' })
    @Length(3, 39, { message: 'Username must be between 3 and 39 characters' })
    @IsString({ message: 'Username is invalid' })
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsEmail({}, { message: 'Email is invalid' })
    @IsString({ message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @Matches(/^[A-Za-z\d!@#$%&*,.?]+$/, { message: 'Password can only contain the following special characters: !@#$%&*,.?' })
    @Matches(/.*[A-Za-z].*/, { message: 'Password must contain at least one letter' })
    @Matches(/.*\d.*/, { message: 'Password must contain at least one number' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsString({ message: 'Password is invalid' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
