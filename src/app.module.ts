import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DrizzleModule, UsersModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
