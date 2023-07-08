/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
    status: number;
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Page Not Found - ${req.originalUrl}`);
    res.status(404).json({ success: false, msg: error.message });
};

export const globalErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.log(err.message);

    const status = err.status || 500;
    const message = err.message || '500 Internal Server Error';

    res.status(status).json({ success: false, msg: message });
};
