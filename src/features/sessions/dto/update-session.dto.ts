import { IsDate, IsOptional } from 'class-validator';

export class UpdateSessionDto {
    @IsOptional()
    @IsDate({ message: 'Expires at is invalid' })
    expires_at?: Date;
}
