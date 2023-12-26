import { pgTable, varchar, pgEnum, boolean, serial, timestamp, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ENUMS

export const userRoleEnum = pgEnum('user_role', ['USER', 'DEVELOPER', 'ADMIN']);

// TABLES

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    role: userRoleEnum('role').default('USER').notNull(),
});

export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    is_published: boolean('is_published').default(false).notNull(),
    author_id: integer('author_id').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    content: varchar('content', { length: 255 }).notNull(),
    created_at: timestamp('created_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date', withTimezone: true, precision: 6 }).defaultNow().notNull(),
    user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    post_id: integer('post_id').references(() => posts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

// INFERRED TYPES

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.author_id],
        references: [users.id],
    }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    user: one(users, {
        fields: [comments.user_id],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [comments.post_id],
        references: [posts.id],
    }),
}));
