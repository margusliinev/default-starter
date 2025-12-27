import { t } from 'elysia';

const OAuthCallbackQuerySchema = t.Object({
    code: t.Optional(t.String()),
    state: t.Optional(t.String()),
    error: t.Optional(t.String()),
    error_description: t.Optional(t.String()),
});

export { OAuthCallbackQuerySchema };
