import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Please add your current password' })
    currentPassword: string;

    @Matches(/^[A-Za-z\d!@#$%&*,.?]+$/, { message: 'Password can only contain the following special characters: !@#$%&*,.?' })
    @Matches(/.*[A-Za-z].*/, { message: 'Password must contain at least one letter' })
    @Matches(/.*\d.*/, { message: 'Password must contain at least one number' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Please choose a new password' })
    newPassword: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Please confirm your password' })
    confirmNewPassword: string;
}
