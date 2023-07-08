import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const result = await db.select().from(users);
    if (result.length < 1) throw new NotFoundError('No users found');

    res.status(200).json({ success: true, user: result });
};