import { CustomAPIError } from './CustomApiError';

class BadRequestError extends CustomAPIError {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
    }
}

export { BadRequestError };
