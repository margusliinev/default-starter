import { Request, Response } from 'express';
import moment from 'moment';

import { db } from '../../db';
import { NewUser,users } from '../../db/schema';
import {
    BadRequestError,
    createCookie,
    createToken,
    hashPassword,
    isEmailUnique,
    normalizeEmail,
    validateEmail,
    validatePassword,
    validateUsername,
} from '../../utils';

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body as NewUser;

    if (!username || !email || !password) {
        throw new BadRequestError('Missing username, email or password');
    }

    validateUsername(username);
    validateEmail(email);
    validatePassword(password);

    const normalizedEmail = normalizeEmail(email);

    const uniqueEmail = await isEmailUnique(normalizedEmail);
    if (!uniqueEmail) throw new BadRequestError('Email is already in use');

    const hash = await hashPassword(password);

    const registerTime = moment.utc().toDate();

    const result = await db
        .insert(users)
        .values({ username: username, email: normalizedEmail, password: hash, created_at: registerTime, updated_at: registerTime })
        .returning();

    const newUser = result[0];
    if (!newUser) throw new BadRequestError('Failed to create user');

    const token = createToken({ userId: newUser.id, role: 'user' });

    createCookie({ res, token });

    res.status(201).json({ success: true, msg: 'Your account has been created' });
};
