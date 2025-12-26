import { deleteExpiredSessions } from '@/queries';
import { cron, Patterns } from '@elysiajs/cron';
import { Elysia } from 'elysia';

export const featureCrons = new Elysia({ name: 'feature:crons' }).use(
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
