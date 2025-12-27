import { relations } from '@/database/relations';
import { drizzle } from 'drizzle-orm/bun-sql';
import { env } from '@/common/env';
import { SQL } from 'bun';
import * as schema from './schema';

const client = new SQL({
    url: env.DATABASE_URL,
    max: 10,
});

const db = drizzle({
    client,
    schema,
    relations,
});

export { db, schema };
