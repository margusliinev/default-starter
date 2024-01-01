import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [DrizzleModule, CloudinaryModule, NestjsFormDataModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
