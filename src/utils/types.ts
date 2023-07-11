import { Request } from 'express';

import { Role } from '../db/schema';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        role: Role;
    };
    cookies: {
        token: string;
    };
}
