import { pgTable, varchar, pgEnum, boolean, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ENUMS

export const userRoleEnum = pgEnum('user_role', ['USER', 'DEVELOPER', 'ADMIN']);

// TABLES

export const usersTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    role: userRoleEnum('role').default('USER').notNull(),
});

export const postsTable = pgTable('posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    is_published: boolean('is_published').default(false).notNull(),
    author_id: uuid('author_id').references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const commentsTable = pgTable('comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    content: varchar('content', { length: 255 }).notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    user_id: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    post_id: uuid('post_id').references(() => postsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

// INFERRED TYPES

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// RELATIONS

export const usersRelations = relations(usersTable, ({ many }) => ({
    posts: many(postsTable),
}));

export const postsRelations = relations(postsTable, ({ one }) => ({
    author: one(usersTable, {
        fields: [postsTable.author_id],
        references: [usersTable.id],
    }),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [commentsTable.user_id],
        references: [usersTable.id],
    }),
    post: one(postsTable, {
        fields: [commentsTable.post_id],
        references: [postsTable.id],
    }),
}));
