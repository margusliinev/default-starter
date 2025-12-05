import { IsEmail, IsLowercase, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @MaxLength(255, { message: 'Name is too long' })
    @MinLength(2, { message: 'Name is too short' })
    @IsString({ message: 'Name is invalid' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsLowercase({ message: 'Email must be lowercase' })
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsOptional()
    @IsString({ message: 'Image is invalid' })
    image?: string;
}
