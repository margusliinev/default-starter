import { Response } from 'express';

interface CreateCookieParams {
    res: Response;
    token: string;
}

export const createCookie = ({ res, token }: CreateCookieParams) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24,
    });
};
