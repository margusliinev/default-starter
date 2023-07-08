import { InferModel } from 'drizzle-orm';
import { pgEnum, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin', 'test']);

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 16 }).notNull(),
    email: varchar('email', { length: 50 }).notNull(),
    password: varchar('password', { length: 256 }).notNull(),
    role: roleEnum('role').notNull(),
});

export type User = InferModel<typeof users, 'select'>;
export type NewUser = InferModel<typeof users, 'insert'>;
