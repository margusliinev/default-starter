import type { Static } from 'elysia';
import { pgTable, uuid, timestamp, text, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { sql } from 'drizzle-orm';

export enum Provider {
    CREDENTIALS = 'credentials',
    GITHUB = 'github',
    GOOGLE = 'google',
}

// Adding `export` in front of const providerEnum will generate correct migration for enum type
// Right now `bun run db:generate` does not generate CREATE TYPE for enum
const providerEnum = pgEnum('provider', [Provider.CREDENTIALS, Provider.GITHUB, Provider.GOOGLE]);

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

export const userSelectSchema = createSelectSchema(userTable);
export const userInsertSchema = createInsertSchema(userTable);
export const userUpdateSchema = createUpdateSchema(userTable);

export const accountSelectSchema = createSelectSchema(accountTable);
export const accountInsertSchema = createInsertSchema(accountTable);
export const accountUpdateSchema = createUpdateSchema(accountTable);

export const sessionSelectSchema = createSelectSchema(sessionTable);
export const sessionInsertSchema = createInsertSchema(sessionTable);
export const sessionUpdateSchema = createUpdateSchema(sessionTable);

export type User = Static<typeof userSelectSchema>;
export type CreateUser = Static<typeof userInsertSchema>;
export type UpdateUser = Static<typeof userUpdateSchema>;

export type Account = Static<typeof accountSelectSchema>;
export type CreateAccount = Static<typeof accountInsertSchema>;
export type UpdateAccount = Static<typeof accountUpdateSchema>;

export type Session = Static<typeof sessionSelectSchema>;
export type CreateSession = Static<typeof sessionInsertSchema>;
export type UpdateSession = Static<typeof sessionUpdateSchema>;
