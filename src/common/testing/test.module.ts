import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, validate } from '../../config/env';
import { AccountsService } from '../../features/accounts/accounts.service';
import { Account } from '../../features/accounts/entities/account.entity';
import { AuthService } from '../../features/auth/auth.service';
import { Session } from '../../features/sessions/entities/session.entity';
import { SessionsService } from '../../features/sessions/sessions.service';
import { User } from '../../features/users/entities/user.entity';
import { UsersService } from '../../features/users/users.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
            validate,
            envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('database.url'),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([User, Account, Session]),
    ],
    providers: [UsersService, AccountsService, SessionsService, AuthService],
    exports: [UsersService, AccountsService, SessionsService, AuthService],
})
export class TestModule {}
