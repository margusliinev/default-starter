import { t } from 'elysia';

export const ErrorResponse = t.Object({
    code: t.String({ error: 'Code is invalid' }),
    message: t.String({ error: 'Message is invalid' }),
    errors: t.Optional(t.Record(t.String({ error: 'Field is invalid' }), t.String({ error: 'Error is invalid' }))),
});

export const MessageResponse = t.Object({
    message: t.String({ error: 'Message is invalid' }),
});

export const VoidResponse = t.Void({ error: 'Empty response is invalid' });
