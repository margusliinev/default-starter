import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
import { DrizzleModule } from 'src/modules/drizzle/drizzle.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [DrizzleModule, CloudinaryModule, NestjsFormDataModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
