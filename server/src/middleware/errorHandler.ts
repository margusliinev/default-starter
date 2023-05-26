import { Request, Response, NextFunction } from 'express';

const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    const defaultError = {
        statusCode: err.statusCode || 500,
        msg: err.message || 'Something went wrong, try again later',
    };
    return res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

export default errorHandler;
