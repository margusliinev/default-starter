import { AccountsModule } from '../features/accounts/accounts.module';
import { SessionsModule } from '../features/sessions/sessions.module';
import { UsersModule } from '../features/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config, validate } from '../common/config/env';
import { RootCommand } from './commands/root.command';
import { SeedCommand } from './commands/seed.command';
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
                autoLoadEntities: true,
                url: configService.get<string>('database.url'),
            }),
        }),
        UsersModule,
        AccountsModule,
        SessionsModule,
    ],
    providers: [RootCommand, SeedCommand],
})
export class CliModule {}
