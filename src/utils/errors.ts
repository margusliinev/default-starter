export class BadRequestError extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
        this.status = 400;
    }
}
export class UnauthenticatedError extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.name = 'UnauthenticatedError';
        this.status = 401;
    }
}
export class UnauthorizedError extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
        this.status = 403;
    }
}
export class NotFoundError extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
    }
}
