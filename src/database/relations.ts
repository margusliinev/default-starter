import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
    userTable: {
        accounts: r.many.accountTable(),
        sessions: r.many.sessionTable(),
    },
    accountTable: {
        user: r.one.userTable({
            from: r.accountTable.user_id,
            to: r.userTable.id,
        }),
    },
    sessionTable: {
        user: r.one.userTable({
            from: r.sessionTable.user_id,
            to: r.userTable.id,
        }),
    },
}));
