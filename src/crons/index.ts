import { deleteExpiredSessions } from '@/queries/sessions';
import { cron, Patterns } from '@elysiajs/cron';
import { Elysia } from 'elysia';

export const cronjobs = new Elysia({ name: 'cron' }).use(
    cron({
        name: 'deleteExpiredSessions',
        pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
        async run() {
            console.log('[CRON] deleteExpiredSessions started');
            await deleteExpiredSessions();
            console.log('[CRON] deleteExpiredSessions finished');
        },
    }),
);
