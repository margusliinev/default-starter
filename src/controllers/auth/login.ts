import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

import { db } from '../../db';
import { User,users } from '../../db/schema';
import { BadRequestError, comparePassword,createCookie, createToken, normalizeEmail, UnauthenticatedError } from '../../utils';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as User;

    if (!email || !password) {
        throw new BadRequestError('Missing email or password');
    }

    const normalizedEmail = normalizeEmail(email);

    const result = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (result.length < 1) throw new UnauthenticatedError('Incorrect email or password');
    const user = result[0];

    if (!user) {
        throw new UnauthenticatedError('Incorrect email or password');
    }

    const hashedPassword = user.password;

    const isPasswordCorrect = await comparePassword(password, hashedPassword);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Incorrect email or password');
    }

    const token = createToken({ userId: user.id, role: 'user' });

    createCookie({ res, token });

    res.status(200).json({ success: true, msg: 'Login successful' });
};
