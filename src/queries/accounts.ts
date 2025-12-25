import type { Datasource } from '@/db';
import type { Account, CreateAccount } from '@/db/schema';
import { accountTable, Provider } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';

export function findCredentialsAccount(userId: Account['user_id'], datasource: Datasource = db) {
    return datasource
        .select()
        .from(accountTable)
        .where(and(eq(accountTable.user_id, userId), eq(accountTable.provider, Provider.CREDENTIALS)));
}

export function findOAuthAccount(provider: Account['provider'], providerId: Account['provider_id'], datasource: Datasource = db) {
    return datasource
        .select()
        .from(accountTable)
        .where(and(eq(accountTable.provider, provider), eq(accountTable.provider_id, providerId)));
}

export function createAccount(data: CreateAccount, datasource: Datasource = db) {
    return datasource.insert(accountTable).values(data);
}
