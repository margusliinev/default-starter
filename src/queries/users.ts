import type { Datasource, User, CreateUser, UpdateUser } from '@/common/types';
import { userTable } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/database';

export function findUserByEmail(email: User['email'], datasource: Datasource = db) {
    return datasource.select().from(userTable).where(eq(userTable.email, email));
}

export function createUser(data: CreateUser, datasource: Datasource = db) {
    return datasource.insert(userTable).values(data).returning();
}

export function updateUser(id: User['id'], data: UpdateUser, datasource: Datasource = db) {
    return datasource.update(userTable).set(data).where(eq(userTable.id, id)).returning();
}

export function deleteUser(id: User['id'], datasource: Datasource = db) {
    return datasource.delete(userTable).where(eq(userTable.id, id));
}
