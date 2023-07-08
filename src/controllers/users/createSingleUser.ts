import { Response } from 'express';

import { db } from '../../db/index';
import { NewUser, users } from '../../db/schema';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const createSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const newUser = req.body as NewUser;

    const result = await db.insert(users).values(newUser).returning();
    if (!result[0]) throw new NotFoundError('Failed to create user');
    const user = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        role: result[0].role,
    };

    res.status(200).json({ success: true, user: user, msg: 'User has been created' });
};
