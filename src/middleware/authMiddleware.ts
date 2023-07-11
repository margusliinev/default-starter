import { NextFunction, Response } from 'express';

import { AuthenticatedRequest, UnauthenticatedError, verifyToken } from '../utils';

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
    try {
        const { userId, role } = verifyToken(token);
        req.user = { userId, role };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid');
    }
};
