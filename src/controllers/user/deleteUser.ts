import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { AuthenticatedRequest,NotFoundError, UnauthenticatedError } from '../../utils';

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    const result = await db.delete(users).where(eq(users.id, req.user.userId)).returning();
    const user = result[0];
    if (!user) throw new NotFoundError('Failed to delete user');

    res.cookie('token', 'delete', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });

    res.status(204).json({ success: true, msg: 'User has been deleted' });
};
