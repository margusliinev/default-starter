import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @MaxLength(50, { message: 'Username is too long' })
    @MinLength(2, { message: 'Username is too short' })
    @IsString({ message: 'Username is invalid' })
    username?: string;

    @IsOptional()
    @MaxLength(255, { message: 'Email is too long' })
    @IsEmail({}, { message: 'Email is invalid' })
    email?: string;

    @IsOptional()
    @MaxLength(255, { message: 'Password is too long' })
    @MinLength(8, { message: 'Password is too short' })
    @IsString({ message: 'Password is invalid' })
    password?: string;
}
