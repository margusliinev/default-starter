import type { Static, Cookie } from 'elysia';
import {
    userSelectSchema,
    userInsertSchema,
    userUpdateSchema,
    accountSelectSchema,
    accountInsertSchema,
    accountUpdateSchema,
    sessionSelectSchema,
    sessionInsertSchema,
    sessionUpdateSchema,
} from '@/common/schemas';
import { db } from '@/database';

type User = Static<typeof userSelectSchema>;
type CreateUser = Static<typeof userInsertSchema>;
type UpdateUser = Static<typeof userUpdateSchema>;

type Account = Static<typeof accountSelectSchema>;
type CreateAccount = Static<typeof accountInsertSchema>;
type UpdateAccount = Static<typeof accountUpdateSchema>;

type Session = Static<typeof sessionSelectSchema>;
type CreateSession = Static<typeof sessionInsertSchema>;
type UpdateSession = Static<typeof sessionUpdateSchema>;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Datasource = typeof db | Transaction;

type Cookies = {
    session: Cookie<string | undefined>;
    oauth_state: Cookie<string | undefined>;
};

export type {
    User,
    CreateUser,
    UpdateUser,
    Account,
    CreateAccount,
    UpdateAccount,
    Session,
    CreateSession,
    UpdateSession,
    Datasource,
    Cookies,
};
