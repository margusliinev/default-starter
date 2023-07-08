import { eq } from 'drizzle-orm';
import { NextFunction, Response } from 'express';

import { db } from '../db';
import { users } from '../db/schema';
import { UnauthenticatedError } from '../errors';
import { verifyJWT } from '../utils/token';
import { AuthenticatedRequest } from '../utils/types';

export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
    try {
        const decoded = verifyJWT(token);
        const result = await db.select().from(users).where(eq(users.id, decoded.userId));
        req.userId = result[0].id;
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
};
