import { and, eq, not } from 'drizzle-orm';

import { db } from '../db/index';
import { users } from '../db/schema';
import { BadRequestError } from '../errors';

const usernameRegex = /^[A-Za-z0-9]{3,16}$/;
const emailRegex = /^[^\s@]{1,50}@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%&*,.?]{8,}$/;

export const validateUsername = (username: string) => {
    if (!usernameRegex.test(username)) {
        if (username.length < 3 || username.length > 16) {
            throw new BadRequestError('Invalid username, username must be between 3-16 characters');
        } else {
            throw new BadRequestError('Invalid username, username can only contain letters (A-Z) and numbers (0-9)');
        }
    }
};
export const validateEmail = (email: string) => {
    if (!emailRegex.test(email)) {
        throw new BadRequestError('Email is invalid');
    }
};
export const validatePassword = (password: string) => {
    if (!passwordRegex.test(password)) {
        if (password.length < 8) {
            throw new BadRequestError('Password must be at least 8 characters long');
        } else if (!/(?=.*[a-z])/.test(password)) {
            throw new BadRequestError('Password must contain at least one letter');
        } else if (!/(?=.*\d)/.test(password)) {
            throw new BadRequestError('Password must contain at least one number');
        } else {
            throw new BadRequestError('Allowed special characters in password: !@#$%&*,.?');
        }
    }
};
export const validateUniqueEmail = async (email: string) => {
    const result = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email.toLowerCase().trim())));
    if (result.length >= 1) {
        throw new BadRequestError('Email address is already in use');
    } else {
        return;
    }
};
export const validateUniqueEmailOnUpdate = async (email: string, userId: number) => {
    const result = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email.toLowerCase().trim()), not(eq(users.id, userId))));
    if (result.length >= 1) {
        throw new BadRequestError('Email address is already in use');
    } else {
        return email;
    }
};
