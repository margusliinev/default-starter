import { Module } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATA_SOURCE = 'DATA_SOURCE';
export type DATA_SOURCE_TYPE = NodePgDatabase<typeof schema>;

@Module({
    providers: [
        {
            provide: DATA_SOURCE,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const connectionString = configService.get<string>('DATABASE_URL');
                const pool = new Pool({
                    connectionString,
                });

                return drizzle(pool, { schema });
            },
        },
    ],
    exports: [DATA_SOURCE],
})
export class DrizzleModule {}
