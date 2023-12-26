import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import * as schema from './schema';

const DRIZZLE = 'DRIZZLE';

@Module({
    providers: [
        {
            provide: DRIZZLE,
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
    exports: [DRIZZLE],
})
export class DrizzleModule {}
