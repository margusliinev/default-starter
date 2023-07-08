import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { NotFoundError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    const result = await db.select().from(users).where(eq(users.id, req.user.userId));
    if (!result[0]) throw new NotFoundError('User not found');
    const user = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        role: result[0].role,
    };

    res.status(200).json({ success: true, user: user });
};
