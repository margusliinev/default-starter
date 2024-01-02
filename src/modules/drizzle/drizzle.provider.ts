import { ConfigService } from '@nestjs/config';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../db/schema';

export const DATA_SOURCE = 'DATA_SOURCE';
export type DATA_SOURCE_TYPE = NodePgDatabase<typeof schema>;

export const DrizzleProvider = {
    provide: DATA_SOURCE,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): DATA_SOURCE_TYPE => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
            connectionString,
        });

        return drizzle(pool, { schema });
    },
};
