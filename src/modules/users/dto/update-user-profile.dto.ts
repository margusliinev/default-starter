import { IsString, IsNotEmpty, Length, Matches, IsEmail, IsOptional } from 'class-validator';
import { HasMimeType, IsFile, MaxFileSize } from 'nestjs-form-data';

export class UpdateUserProfileDto {
    @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters (A-Z), numbers (0-9), and hyphens (-)' })
    @Matches(/^[^-].*[^-]$/, { message: 'Username cannot start or end with a hyphen' })
    @Length(3, 39, { message: 'Username must be between 3 and 39 characters' })
    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsEmail({}, { message: 'Email is invalid' })
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsOptional()
    @MaxFileSize(500000, { message: 'Photo should be less than 0.5MB' })
    @HasMimeType(['image/jpeg', 'image/jpg', 'image/png'], { message: 'Photo should be in jpeg, jpg or png format' })
    @IsFile({ message: 'Photo is invalid' })
    photo: Express.Multer.File;
}
