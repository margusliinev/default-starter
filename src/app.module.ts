import { AccountsModule } from './features/accounts/accounts.module';
import { SessionsModule } from './features/sessions/sessions.module';
import { HealthModule } from './features/health/health.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { CronsModule } from './crons/crons.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config, validate } from './common/config/env';
import { AuthGuard } from './features/auth/auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
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
                useUTC: true,
                autoLoadEntities: true,
                port: configService.get<number>('database.port'),
                host: configService.get<string>('database.host'),
                database: configService.get<string>('database.name'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
            }),
        }),
        UsersModule,
        AuthModule,
        AccountsModule,
        SessionsModule,
        HealthModule,
        CronsModule,
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
})
export class AppModule {}
