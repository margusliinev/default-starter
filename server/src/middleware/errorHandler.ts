import { NextFunction, Request, Response } from 'express';

interface CustomError {
    statusCode: number;
    message: string;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const defaultError = {
        statusCode: err.statusCode || 500,
        msg: err.message || '500 Internal Server Error',
    };
    return res.status(defaultError.statusCode).json({ success: false, msg: defaultError.msg });
};

export default errorHandler;
