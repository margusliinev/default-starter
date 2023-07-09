import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const deleteSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const { id } = req.body as { id: number };

    const result = await db.delete(users).where(eq(users.id, id)).returning();
    const user = result[0];
    if (!user) throw new NotFoundError('Failed to delete user');

    res.status(204).json({ success: true, msg: 'User has been deleted' });
};
