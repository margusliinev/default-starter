import { deleteExpiredSessions } from '@/queries/sessions';
import { cron } from '@elysiajs/cron';
import { Elysia } from 'elysia';

export const cronPlugin = new Elysia().use(
    cron({
        name: 'deleteExpiredSessions',
        pattern: '0 0 * * *',
        async run() {
            console.log('[CRON] deleteExpiredSessions started');
            await deleteExpiredSessions();
            console.log('[CRON] deleteExpiredSessions finished');
        },
    }),
);
