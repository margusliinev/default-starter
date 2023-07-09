import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { User, users } from '../../db/schema';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { UnauthenticatedError } from '../../errors';
import { AuthenticatedRequest } from '../../utils/types';
import { validateEmail, validateUniqueEmail } from '../../utils/validate';

export const updateSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const { id, username, email, role } = req.body as User;

    validateEmail(email);
    await validateUniqueEmail(email);

    const result = await db.update(users).set({ username: username, email: email.toLowerCase().trim(), role: role }).where(eq(users.id, id)).returning();
    if (!result[0]) throw new NotFoundError('Failed to update user');
    const updatedUser = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        role: result[0].role,
    };

    res.status(200).json({ success: true, user: updatedUser, msg: 'User has been updated' });
};
