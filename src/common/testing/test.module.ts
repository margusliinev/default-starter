import { AccountsService } from '../../features/accounts/accounts.service';
import { SessionsService } from '../../features/sessions/sessions.service';
import { UsersService } from '../../features/users/users.service';
import { AuthService } from '../../features/auth/auth.service';
import { Account } from '../../features/accounts/entities/account.entity';
import { Session } from '../../features/sessions/entities/session.entity';
import { User } from '../../features/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config, validate } from '../config/env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [config], validate }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                useUTC: true,
                synchronize: true,
                autoLoadEntities: true,
                port: configService.get<number>('database.port'),
                host: configService.get<string>('database.host'),
                database: configService.get<string>('database.name') + '_test',
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
            }),
        }),
        TypeOrmModule.forFeature([User, Account, Session]),
    ],
    providers: [UsersService, AccountsService, SessionsService, AuthService],
    exports: [UsersService, AccountsService, SessionsService, AuthService],
})
export class TestModule {}
