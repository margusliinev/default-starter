import { Response } from 'express';

import { db } from '../../db/index';
import { NewUser, users } from '../../db/schema';
import { BadRequestError, NotFoundError, UnauthenticatedError, UnauthorizedError } from '../../errors';
import { hashPassword } from '../../utils/bcrypt';
import { AuthenticatedRequest } from '../../utils/types';
import { validateEmail, validatePassword, validateUniqueEmail, validateUsername } from '../../utils/validate';

export const createSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    if (req.user.role !== 'admin') throw new UnauthorizedError('You are not authorized to access this route');

    const newUser = req.body as NewUser;

    if (!newUser.username || !newUser.email || !newUser.password || !newUser.role) {
        throw new BadRequestError('Missing username, email, password or role');
    }

    await validateUniqueEmail(newUser.email);

    validateUsername(newUser.username);
    validateEmail(newUser.email);
    validatePassword(newUser.password);

    newUser.email = newUser.email.toLowerCase().trim();

    const hashedPassword = await hashPassword(newUser.password);

    newUser.password = hashedPassword;

    if (newUser.role !== 'admin' && newUser.role !== 'user' && newUser.role !== 'test') {
        throw new BadRequestError('Role must be either admin, user, or test');
    }

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
