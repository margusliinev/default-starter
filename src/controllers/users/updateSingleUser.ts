import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { User, users } from '../../db/schema';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const createSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const user = req.body as User;

    const result = await db.update(users).set(user).where(eq(users.id, req.user.userId)).returning();
    if (!result[0]) throw new NotFoundError('Failed to update user');
    const updatedUser = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        role: result[0].role,
    };

    res.status(200).json({ success: true, user: updatedUser, msg: 'User has been updated' });
};
