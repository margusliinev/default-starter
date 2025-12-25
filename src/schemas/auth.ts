import { t } from 'elysia';

export const RegisterBody = t.Object({
    name: t.String({ minLength: 1, maxLength: 254, error: 'Name is missing or invalid' }),
    email: t.String({ minLength: 1, maxLength: 254, error: 'Email is missing or invalid', format: 'email' }),
    password: t.String({ minLength: 8, maxLength: 254, error: 'Password is missing or invalid' }),
});

export const LoginBody = t.Object({
    email: t.String({ minLength: 1, maxLength: 254, error: 'Email is missing or invalid', format: 'email' }),
    password: t.String({ minLength: 8, maxLength: 254, error: 'Password is missing or invalid' }),
});

export const OAuthCallbackQuery = t.Object({
    code: t.Optional(t.String()),
    state: t.Optional(t.String()),
    error: t.Optional(t.String()),
    error_description: t.Optional(t.String()),
});
