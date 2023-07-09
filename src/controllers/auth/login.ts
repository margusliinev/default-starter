import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

import { db } from '../../db';
import { users } from '../../db/schema';
import { BadRequestError, UnauthenticatedError } from '../../errors';
import { comparePassword } from '../../utils/bcrypt';
import { createCookie } from '../../utils/cookie';
import { createJWT } from '../../utils/token';
import { Login } from '../../utils/types';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as Login;

    if (!email || !password) {
        throw new BadRequestError('Missing email or password');
    }

    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
        throw new UnauthenticatedError('Incorrect email or password');
    }

    const hashedPassword = user.password;

    const isPasswordCorrect = await comparePassword(password, hashedPassword);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Incorrect email or password');
    }

    const token = createJWT({ userId: user.id, role: user.role });

    createCookie({ res, token });

    res.status(200).json({
        success: true,
        msg: 'Login successful',
    });
};
