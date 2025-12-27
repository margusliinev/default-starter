import type { Datasource, Account, CreateAccount } from '@/common/types';
import { Provider } from '@/common/enums';
import { db, schema } from '@/database';
import { and, eq } from 'drizzle-orm';

export function findCredentialsAccount(userId: Account['user_id'], datasource: Datasource = db) {
    return datasource
        .select()
        .from(schema.accountTable)
        .where(and(eq(schema.accountTable.user_id, userId), eq(schema.accountTable.provider, Provider.CREDENTIALS)));
}

export function findOAuthAccount(provider: Account['provider'], providerId: Account['provider_id'], datasource: Datasource = db) {
    return datasource
        .select()
        .from(schema.accountTable)
        .where(and(eq(schema.accountTable.provider, provider), eq(schema.accountTable.provider_id, providerId)));
}

export function createAccount(data: CreateAccount, datasource: Datasource = db) {
    return datasource.insert(schema.accountTable).values(data);
}
