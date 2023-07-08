import jwt, { JwtPayload } from 'jsonwebtoken';

export interface DecodedJwtPayload extends JwtPayload {
    userId: number;
}

export const createJWT = (payload: JwtPayload) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        throw new Error('JWT_SECRET or JWT_EXPIRES_IN environment variable is not defined');
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return token;
};

export const verifyJWT = (token: string) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedJwtPayload;

    return decoded;
};
