import type { Datasource } from '@/db';
import type { User, CreateUser, UpdateUser } from '@/db/schema';
import { userTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db';

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
