import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const getSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const result = await db.select().from(users).where(eq(users.id, req.user.userId));
    const user = result[0];
    if (!user) throw new NotFoundError('No user found');

    res.status(200).json({ success: true, user: user });
};