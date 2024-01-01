import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DrizzleModule, UsersModule, CloudinaryModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
