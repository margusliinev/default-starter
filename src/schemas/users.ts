import { t } from 'elysia';

export const UpdateUserBody = t.Object({
    name: t.Optional(t.String({ error: 'Name is invalid' })),
    email: t.Optional(t.String({ error: 'Email is invalid', format: 'email' })),
    image: t.Optional(t.Nullable(t.String({ error: 'Image is invalid' }))),
});
