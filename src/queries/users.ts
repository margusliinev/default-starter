import type { Datasource, User, CreateUser, UpdateUser } from '@/common';
import { db, schema } from '@/database';
import { eq } from 'drizzle-orm';

export function findUserByEmail(email: User['email'], datasource: Datasource = db) {
    return datasource.select().from(schema.userTable).where(eq(schema.userTable.email, email));
}

export function createUser(data: CreateUser, datasource: Datasource = db) {
    return datasource.insert(schema.userTable).values(data).returning();
}

export function updateUser(id: User['id'], data: UpdateUser, datasource: Datasource = db) {
    return datasource.update(schema.userTable).set(data).where(eq(schema.userTable.id, id)).returning();
}

export function deleteUser(id: User['id'], datasource: Datasource = db) {
    return datasource.delete(schema.userTable).where(eq(schema.userTable.id, id));
}
