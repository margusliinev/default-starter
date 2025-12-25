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
    code: t.String({ error: 'Code is invalid' }),
    message: t.String({ error: 'Message is invalid' }),
    errors: t.Optional(t.Record(t.String({ error: 'Field is invalid' }), t.String({ error: 'Error is invalid' }))),
});
const MessageSchema = t.Object({
    message: t.String({ error: 'Message is invalid' }),
});
const VoidSchema = t.Void({ error: 'Empty response is invalid' });

const RegisterSchema = t.Object({
    name: t.String({ minLength: 1, maxLength: 254, error: 'Name is missing or invalid' }),
    email: t.String({ minLength: 1, maxLength: 254, error: 'Email is missing or invalid', format: 'email' }),
    password: t.String({ minLength: 8, maxLength: 254, error: 'Password is missing or invalid' }),
});
const LoginSchema = t.Object({
    email: t.String({ minLength: 1, maxLength: 254, error: 'Email is missing or invalid', format: 'email' }),
    password: t.String({ minLength: 8, maxLength: 254, error: 'Password is missing or invalid' }),
});
const OAuthCallbackQuerySchema = t.Object({
    code: t.Optional(t.String()),
    state: t.Optional(t.String()),
    error: t.Optional(t.String()),
    error_description: t.Optional(t.String()),
});

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
    VoidSchema,
    RegisterSchema,
    LoginSchema,
    OAuthCallbackQuerySchema,
};
