import { pgTable, uuid, timestamp, text, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { Provider } from '@/common/enums';
import { sql } from 'drizzle-orm';

export const providerEnum = pgEnum('provider', [Provider.CREDENTIALS, Provider.GITHUB, Provider.GOOGLE]);

export const userTable = pgTable('user', {
    id: uuid()
        .primaryKey()
        .default(sql`uuidv7()`),
    name: text().notNull(),
    email: text().notNull().unique(),
    image: text(),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
});

export const accountTable = pgTable(
    'account',
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`),
        user_id: uuid()
            .notNull()
            .references(() => userTable.id, { onDelete: 'cascade' }),
        password: text(),
        provider: providerEnum().notNull(),
        provider_id: text().notNull(),
        created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('accounts_provider_provider_id_unique').on(table.provider, table.provider_id),
        index('accounts_user_id_idx').on(table.user_id),
    ],
);

export const sessionTable = pgTable(
    'session',
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`),
        user_id: uuid()
            .notNull()
            .references(() => userTable.id, { onDelete: 'cascade' }),
        token: text().notNull().unique(),
        expires_at: timestamp({ mode: 'date', withTimezone: true }).notNull(),
        created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [index('sessions_token_idx').on(table.token), index('sessions_user_id_idx').on(table.user_id)],
);
