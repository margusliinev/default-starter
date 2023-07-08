import { Request } from 'express';

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    TEST = 'test',
}

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        role: Role;
    };
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