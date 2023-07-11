import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { AuthenticatedRequest,NotFoundError, UnauthenticatedError } from '../../utils';

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    const result = await db.select().from(users).where(eq(users.id, req.user.userId));
    if (!result[0]) throw new NotFoundError('User not found');

    const user = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        first_name: result[0].first_name,
        last_name: result[0].last_name,
        profile_picture: result[0].profile_picture,
        created_at: result[0].created_at,
        updated_at: result[0].updated_at,
        role: result[0].role,
    };

    res.status(200).json({ success: true, user: user });
};
