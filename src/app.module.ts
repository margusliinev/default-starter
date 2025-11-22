import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SessionsModule } from './features/sessions/sessions.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './features/auth/auth.guard';
import { config, validate } from './config/env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [config], validate }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('database.host'),
                port: configService.get('database.port'),
                username: configService.get('database.username'),
                password: configService.get('database.password'),
                database: configService.get('database.database'),
                autoLoadEntities: true,
            }),
        }),
        UsersModule,
        SessionsModule,
        AuthModule,
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
})
export class AppModule {}
