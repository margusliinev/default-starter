import { t } from 'elysia';

const RegisterSchema = t.Object({
    name: t.String({ minLength: 2, maxLength: 100, error: 'Name must be between 2 and 100 characters' }),
    email: t.String({ minLength: 5, maxLength: 254, format: 'email', error: 'Valid email is required' }),
    password: t.String({
        minLength: 8,
        maxLength: 128,
        pattern: '^(?=.*[a-zA-Z])(?=.*[0-9]).*$',
        error: 'Password must be 8-128 characters with at least 1 letter and 1 number',
    }),
});
const LoginSchema = t.Object({
    email: t.String({ minLength: 5, maxLength: 254, format: 'email', error: 'Email or password is incorrect' }),
    password: t.String({
        minLength: 8,
        maxLength: 128,
        pattern: '^(?=.*[a-zA-Z])(?=.*[0-9]).*$',
        error: 'Email or password is incorrect',
    }),
});

export { RegisterSchema, LoginSchema };
