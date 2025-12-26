import type { Datasource, Session, CreateSession, UpdateSession } from '@/common';
import { db, schema } from '@/database';
import { eq, lt } from 'drizzle-orm';

export function findSessionWithUser(hashedToken: Session['token'], datasource: Datasource = db) {
    return datasource
        .select()
        .from(schema.sessionTable)
        .innerJoin(schema.userTable, eq(schema.sessionTable.user_id, schema.userTable.id))
        .where(eq(schema.sessionTable.token, hashedToken));
}

export function createSession(data: CreateSession, datasource: Datasource = db) {
    return datasource.insert(schema.sessionTable).values(data);
}

export function updateSession(id: Session['id'], data: UpdateSession, datasource: Datasource = db) {
    return datasource.update(schema.sessionTable).set(data).where(eq(schema.sessionTable.id, id));
}

export function deleteSession(id: Session['id'], datasource: Datasource = db) {
    return datasource.delete(schema.sessionTable).where(eq(schema.sessionTable.id, id));
}

export function deleteUserSessions(userId: Session['user_id'], datasource: Datasource = db) {
    return datasource.delete(schema.sessionTable).where(eq(schema.sessionTable.user_id, userId));
}

export function deleteExpiredSessions(datasource: Datasource = db) {
    return datasource.delete(schema.sessionTable).where(lt(schema.sessionTable.expires_at, new Date()));
}
