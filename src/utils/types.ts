import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    userId?: number;
    cookies: {
        token: string;
    };
}

export interface updateUserProfile {
    username: string;
    email: string;
    password: string;
    newPassword: string;
    confirmNewPassword: string;
}
