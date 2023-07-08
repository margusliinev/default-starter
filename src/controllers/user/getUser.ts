import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { NotFoundError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) throw new UnauthenticatedError('Authentication Invalid');

    const result = await db.select().from(users).where(eq(users.id, req.userId));
    if (!result[0]) throw new NotFoundError('User not found');
    const user = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
    };

    res.status(200).json({ success: true, user: user });
};
