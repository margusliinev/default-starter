import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, validate } from '../config/env';
import { AccountsModule } from '../features/accounts/accounts.module';
import { SessionsModule } from '../features/sessions/sessions.module';
import { UsersModule } from '../features/users/users.module';
import { RootCommand } from './commands/root.command';
import { SeedCommand } from './commands/seed.command';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [config], validate }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
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
