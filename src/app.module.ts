import { AccountsModule } from './features/accounts/accounts.module';
import { SessionsModule } from './features/sessions/sessions.module';
import { HealthModule } from './features/health/health.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { CronsModule } from './crons/crons.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './features/auth/auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, validate } from './config/env';
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
                autoLoadEntities: true,
                url: configService.get<string>('database.url'),
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
