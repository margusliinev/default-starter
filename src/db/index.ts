import { drizzle } from 'drizzle-orm/bun-sql';
import { relations } from './relations';
import { env } from '@/config/env';
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

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Datasource = typeof db | Transaction;

export { db, client };
export type { Datasource };
