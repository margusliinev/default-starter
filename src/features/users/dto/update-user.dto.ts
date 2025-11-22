import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @MaxLength(255, { message: 'Name is too long' })
    @MinLength(2, { message: 'Name is too short' })
    @IsString({ message: 'Name is invalid' })
    name?: string;

    @IsOptional()
    @IsString()
    image?: string;
}
