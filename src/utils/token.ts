import jwt, { JwtPayload } from 'jsonwebtoken';

import { Role } from '../db/schema';

export interface DecodedJwtPayload extends JwtPayload {
    userId: number;
    role: Role;
}

export const createToken = (payload: JwtPayload) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_LIFETIME) {
        throw new Error('JWT_SECRET or JWT_EXPIRES_IN environment variable is not defined');
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });

    return token;
};

export const verifyToken = (token: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedJwtPayload;

    return decoded;
};
