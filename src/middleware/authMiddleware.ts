import { NextFunction, Response } from 'express';

import { UnauthenticatedError } from '../errors';
import { verifyJWT } from '../utils/token';
import { AuthenticatedRequest } from '../utils/types';

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
    try {
        const { userId, role } = verifyJWT(token);
        req.user = { userId, role };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
};
