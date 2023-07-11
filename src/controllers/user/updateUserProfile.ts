import { eq } from 'drizzle-orm';
import { Response } from 'express';
import moment from 'moment';

import { db } from '../../db';
import { users } from '../../db/schema';
import {
    AuthenticatedRequest,
    BadRequestError,
    isUpdatedEmailUnique,
    normalizeEmail,
    UnauthenticatedError,
    validateEmail,
    validateName,
    validateUsername,
} from '../../utils';

interface UserUpdateProfile {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    updated_at: Date;
}

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        throw new UnauthenticatedError('Authentication Invalid');
    }

    const { username, email, first_name, last_name } = req.body as UserUpdateProfile;

    if (!username || !email) {
        throw new BadRequestError('Missing username or email');
    }

    validateUsername(username);
    validateEmail(email);

    const normalizedEmail = normalizeEmail(email);

    const uniqueEmail = await isUpdatedEmailUnique(normalizedEmail, req.user.userId);
    if (!uniqueEmail) throw new BadRequestError('Email is already in use');

    const updateData: Partial<UserUpdateProfile> = { username: username, email: normalizedEmail };

    if (!first_name) {
        const first_name = '';
        updateData.first_name = first_name;
    } else {
        validateName(first_name);
        updateData.first_name = first_name.toLowerCase().trim();
    }
    if (!last_name) {
        const last_name = '';
        updateData.last_name = last_name;
    } else {
        validateName(last_name);
        updateData.last_name = last_name.toLowerCase().trim();
    }

    updateData.updated_at = moment.utc().toDate();

    const result = await db.update(users).set(updateData).where(eq(users.id, req.user.userId)).returning();

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

    res.status(200).json({ success: true, user: user, msg: 'Your profile was successfully updated' });
};
