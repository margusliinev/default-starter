import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { db } from '../../db/index';
import { users } from '../../db/schema';
import { BadRequestError, UnauthenticatedError } from '../../errors';
import { comparePassword, hashPassword } from '../../utils/bcrypt';
import { AuthenticatedRequest, updateUserProfile } from '../../utils/types';
import { validateEmail, validatePassword, validateUniqueEmailOnUpdate, validateUsername } from '../../utils/validate';

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) throw new UnauthenticatedError('Authentication Invalid');

    const { username, email, password, newPassword, confirmNewPassword } = req.body as updateUserProfile;

    if (!username || !email) {
        throw new BadRequestError('Missing email or password');
    }

    if ((password && (!newPassword || !confirmNewPassword)) || (newPassword && (!password || !confirmNewPassword)) || (confirmNewPassword && (!password || !newPassword))) {
        throw new BadRequestError('Please fill in all password fields');
    }

    validateUsername(username);
    validateEmail(email);
    await validateUniqueEmailOnUpdate(email, req.user.userId);

    const updateData: Partial<updateUserProfile> = { username, email };

    if (password && newPassword && confirmNewPassword) {
        validatePassword(newPassword);

        if (newPassword !== confirmNewPassword) {
            throw new BadRequestError('Passwords do not match');
        }
        const result = await db.selectDistinct({ password: users.password }).from(users).where(eq(users.id, req.user.userId));
        const userPassword = result[0].password;

        const passwordMatch = await comparePassword(password, userPassword);

        if (!passwordMatch) {
            throw new BadRequestError('Your current password is incorrect');
        }

        const hashedPassword = await hashPassword(newPassword);

        updateData.password = hashedPassword;
    }

    const result = await db.update(users).set(updateData).where(eq(users.id, req.user.userId)).returning();

    const user = {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email,
        role: result[0].role,
    };

    res.status(200).json({ success: true, user: user, msg: 'Your profile was successfully updated' });
};
