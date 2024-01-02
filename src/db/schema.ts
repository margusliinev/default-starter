import { pgTable, varchar, pgEnum, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ENUMS

export const userRoleEnum = pgEnum('user_role', ['USER', 'DEVELOPER', 'ADMIN']);

// TABLES

export const usersTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    photo: varchar('photo', { length: 255 }),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    role: userRoleEnum('role').default('USER').notNull(),
});

export const sessionsTable = pgTable(
    'sessions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        expires_at: timestamp('expires_at', { mode: 'date', withTimezone: true, precision: 6 }).notNull(),
        created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
        updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
        user_id: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    },
    (table) => {
        return { user_id_idx: index('user_id_idx').on(table.user_id) };
    },
);

// RELATIONS

export const usersRelations = relations(usersTable, ({ many }) => ({
    sessions: many(sessionsTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [sessionsTable.user_id],
        references: [usersTable.id],
    }),
}));

// INFERRED TYPES

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Session = typeof sessionsTable.$inferSelect;
