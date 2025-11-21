import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config, validate } from '../../config/env';
import { Repository, ObjectLiteral } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

export interface TestModuleOptions {
    imports?: any[];
    controllers?: any[];
    providers?: any[];
}

export async function createTestModule(options: TestModuleOptions = {}): Promise<TestingModule> {
    const builder = Test.createTestingModule({
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
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    autoLoadEntities: true,
                    synchronize: true,
                }),
            }),
            ...(options.imports || []),
        ],
        controllers: options.controllers || [],
        providers: options.providers || [],
    });

    return await builder.compile();
}

export function setupRepository<T extends ObjectLiteral>(module: TestingModule, entity: new () => T) {
    const repo = module.get<Repository<T>>(getRepositoryToken(entity));

    return { repo };
}
