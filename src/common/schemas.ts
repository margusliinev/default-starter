import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-typebox';
import { userTable, accountTable, sessionTable } from '@/database/schema';
import { t } from 'elysia';

const userSelectSchema = createSelectSchema(userTable);
const userInsertSchema = createInsertSchema(userTable);
const userUpdateSchema = createUpdateSchema(userTable);

const accountSelectSchema = createSelectSchema(accountTable);
const accountInsertSchema = createInsertSchema(accountTable);
const accountUpdateSchema = createUpdateSchema(accountTable);

const sessionSelectSchema = createSelectSchema(sessionTable);
const sessionInsertSchema = createInsertSchema(sessionTable);
const sessionUpdateSchema = createUpdateSchema(sessionTable);

const ErrorSchema = t.Object({
    code: t.String(),
    message: t.String(),
    issues: t.Optional(t.Record(t.String(), t.String())),
});
const MessageSchema = t.Object({ message: t.String() });
const RedirectSchema = t.Void();
const NoContentSchema = t.Void();

export {
    userSelectSchema,
    userInsertSchema,
    userUpdateSchema,
    accountSelectSchema,
    accountInsertSchema,
    accountUpdateSchema,
    sessionSelectSchema,
    sessionInsertSchema,
    sessionUpdateSchema,
    ErrorSchema,
    MessageSchema,
    RedirectSchema,
    NoContentSchema,
};
