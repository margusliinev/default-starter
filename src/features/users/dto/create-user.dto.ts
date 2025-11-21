import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @MaxLength(50, { message: 'Username is too long' })
    @MinLength(2, { message: 'Username is too short' })
    @IsString({ message: 'Username is invalid' })
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @MaxLength(255, { message: 'Email is too long' })
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @MaxLength(255, { message: 'Password is too long' })
    @MinLength(8, { message: 'Password is too short' })
    @IsString({ message: 'Password is invalid' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
