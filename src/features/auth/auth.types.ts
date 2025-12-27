import type { Static } from 'elysia';
import { RegisterSchema, LoginSchema } from './auth.schemas';

type Register = Static<typeof RegisterSchema>;
type Login = Static<typeof LoginSchema>;

export type { Register, Login };
