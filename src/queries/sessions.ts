import type { Datasource, Session, CreateSession, UpdateSession } from '@/common/types';
import { sessionTable, userTable } from '@/database/schema';
import { eq, lt } from 'drizzle-orm';
import { db } from '@/database';

export function findSessionWithUser(hashedToken: Session['token'], datasource: Datasource = db) {
    return datasource
        .select()
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.user_id, userTable.id))
        .where(eq(sessionTable.token, hashedToken));
}

export function createSession(data: CreateSession, datasource: Datasource = db) {
    return datasource.insert(sessionTable).values(data);
}

export function updateSession(id: Session['id'], data: UpdateSession, datasource: Datasource = db) {
    return datasource.update(sessionTable).set(data).where(eq(sessionTable.id, id));
}

export function deleteSession(id: Session['id'], datasource: Datasource = db) {
    return datasource.delete(sessionTable).where(eq(sessionTable.id, id));
}

export function deleteUserSessions(userId: Session['user_id'], datasource: Datasource = db) {
    return datasource.delete(sessionTable).where(eq(sessionTable.user_id, userId));
}

export function deleteExpiredSessions(datasource: Datasource = db) {
    return datasource.delete(sessionTable).where(lt(sessionTable.expires_at, new Date()));
}
