import type { Session } from '../../features/sessions/entities/session.entity';

declare global {
    namespace Express {
        interface Request {
            session?: Session;
        }
    }
}
