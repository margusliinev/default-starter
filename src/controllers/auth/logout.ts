import { Request, Response } from 'express';

export const logout = (req: Request, res: Response) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(200).json({ success: true, msg: 'User logged out' });
};
