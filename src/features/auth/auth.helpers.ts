import { Request, Response } from 'express';

export function getSessionFromCookie(req: Request) {
    return req.signedCookies?.session;
}

export function createSessionCookie(res: Response, sessionId: string, expiresAt: Date, isProduction: boolean) {
    res.cookie('session', sessionId, {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        signed: true,
        sameSite: 'lax',
        expires: expiresAt,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
}

export function deleteSessionCookie(res: Response, isProduction: boolean) {
    res.clearCookie('session', {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        signed: true,
        sameSite: 'lax',
        expires: new Date(0),
        maxAge: 0,
    });
}
