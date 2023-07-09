import { Request, Response } from 'express';

import { db } from '../../db';
import { users } from '../../db/schema';
import { BadRequestError } from '../../errors';
import { hashPassword } from '../../utils/bcrypt';
import { createCookie } from '../../utils/cookie';
import { createJWT } from '../../utils/token';
import { Register } from '../../utils/types';
import { validateEmail, validatePassword, validateUniqueEmail, validateUsername } from '../../utils/validate';

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body as Register;

    if (!username || !email || !password) {
        throw new BadRequestError('Missing username, email or password');
    }

    await validateUniqueEmail(email);

    validateUsername(username);
    validateEmail(email);
    validatePassword(password);

    const hash = await hashPassword(password);

    const result = await db.insert(users).values({ username: username, email: email.toLowerCase().trim(), password: hash }).returning();
    const newUser = result[0];
    if (!newUser) throw new BadRequestError('Failed to create user');

    const token = createJWT({ userId: newUser.id, role: 'user' });

    createCookie({ res, token });

    res.status(201).json({
        success: true,
        msg: 'Your account has been created',
    });
};
