import { comparePassword,hashPassword } from './bcrypt';
import { createCookie } from './cookie';
import { BadRequestError, NotFoundError,UnauthenticatedError, UnauthorizedError } from './errors';
import { limiter } from './limiter';
import { createToken, verifyToken } from './token';
import { AuthenticatedRequest } from './types';
import { isEmailUnique, isUpdatedEmailUnique, normalizeEmail, validateEmail, validateName,validatePassword, validateUsername } from './validation';

export {
    AuthenticatedRequest,
    BadRequestError,
    comparePassword,
    createCookie,
    createToken,
    hashPassword,
    isEmailUnique,
    isUpdatedEmailUnique,
    limiter,
    normalizeEmail,
    NotFoundError,
    UnauthenticatedError,
    UnauthorizedError,
    validateEmail,
    validateName,
    validatePassword,
    validateUsername,
    verifyToken,
};
