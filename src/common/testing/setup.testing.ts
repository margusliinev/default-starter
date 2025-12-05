import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { config, validate } from '../../config/env';

interface TestModuleOptions {
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
                    autoLoadEntities: true,
                    url: configService.get<string>('database.url'),
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

export function getRepository<T extends ObjectLiteral>(module: TestingModule, entity: new () => T): Repository<T> {
    return module.get<Repository<T>>(getRepositoryToken(entity));
}

export async function clearRepositories(...repositories: Repository<any>[]) {
    for (const repo of repositories) {
        await repo.deleteAll();
    }
}
