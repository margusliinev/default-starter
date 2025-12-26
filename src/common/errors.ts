const ELYSIA_ERRORS = {
    PARSE: { status: 400, message: 'Parse Error' },
    BAD_REQUEST: { status: 400, message: 'Bad Request' },
    INVALID_COOKIE_SIGNATURE: { status: 400, message: 'Invalid Cookie Signature' },
    UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
    PAYMENT_REQUIRED: { status: 402, message: 'Payment Required' },
    FORBIDDEN: { status: 403, message: 'Forbidden' },
    NOT_FOUND: { status: 404, message: 'Not Found' },
    CONFLICT: { status: 409, message: 'Conflict' },
    GONE: { status: 410, message: 'Gone' },
    UNSUPPORTED_MEDIA_TYPE: { status: 415, message: 'Unsupported Media Type' },
    INVALID_FILE_TYPE: { status: 415, message: 'Invalid File Type' },
    VALIDATION: { status: 422, message: 'Unprocessable Entity' },
    TOO_MANY_REQUESTS: { status: 429, message: 'Too Many Requests' },
    INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal Server Error' },
    UNKNOWN: { status: 500, message: 'Unknown Error' },
    SERVICE_UNAVAILABLE: { status: 503, message: 'Service Unavailable' },
} as const;

const ParseError = createError('PARSE');
const BadRequestError = createError('BAD_REQUEST');
const InvalidCookieSignatureError = createError('INVALID_COOKIE_SIGNATURE');
const UnauthorizedError = createError('UNAUTHORIZED');
const PaymentRequiredError = createError('PAYMENT_REQUIRED');
const ForbiddenError = createError('FORBIDDEN');
const NotFoundError = createError('NOT_FOUND');
const ConflictError = createError('CONFLICT');
const GoneError = createError('GONE');
const UnsupportedMediaTypeError = createError('UNSUPPORTED_MEDIA_TYPE');
const InvalidFileError = createError('INVALID_FILE_TYPE');
const ValidationError = createError('VALIDATION');
const TooManyRequestsError = createError('TOO_MANY_REQUESTS');
const InternalServerError = createError('INTERNAL_SERVER_ERROR');
const UnknownError = createError('UNKNOWN');
const ServiceUnavailableError = createError('SERVICE_UNAVAILABLE');

const ERROR_CLASSES = {
    PARSE: ParseError,
    BAD_REQUEST: BadRequestError,
    INVALID_COOKIE_SIGNATURE: InvalidCookieSignatureError,
    UNAUTHORIZED: UnauthorizedError,
    PAYMENT_REQUIRED: PaymentRequiredError,
    FORBIDDEN: ForbiddenError,
    NOT_FOUND: NotFoundError,
    CONFLICT: ConflictError,
    GONE: GoneError,
    UNSUPPORTED_MEDIA_TYPE: UnsupportedMediaTypeError,
    INVALID_FILE_TYPE: InvalidFileError,
    VALIDATION: ValidationError,
    TOO_MANY_REQUESTS: TooManyRequestsError,
    INTERNAL_SERVER_ERROR: InternalServerError,
    UNKNOWN: UnknownError,
    SERVICE_UNAVAILABLE: ServiceUnavailableError,
} as const;

function createError<T extends keyof typeof ELYSIA_ERRORS>(code: T) {
    const { status, message } = ELYSIA_ERRORS[code];
    return class extends Error {
        readonly code = code;
        readonly status = status;
        readonly message = message;
        readonly errors?: Record<string, string>;

        constructor(errors?: Record<string, string>) {
            super(message);
            this.errors = errors;
        }
    };
}

function getErrorStatus(code: keyof typeof ELYSIA_ERRORS | number) {
    if (typeof code === 'number') return ELYSIA_ERRORS['UNKNOWN'].status;
    return ELYSIA_ERRORS[code].status;
}

function getErrorMessage(code: keyof typeof ELYSIA_ERRORS | number) {
    if (typeof code === 'number') return ELYSIA_ERRORS['UNKNOWN'].message;
    return ELYSIA_ERRORS[code].message;
}

function getErrorFields(error: unknown) {
    if (!error || typeof error !== 'object') {
        return undefined;
    }
    if ('errors' in error && error.errors) {
        return error.errors as Record<string, string>;
    }
    if ('all' in error && Array.isArray(error.all)) {
        const errors: Record<string, string> = {};
        for (const err of error.all) {
            if (!('path' in err)) continue;
            const { path, schema, message } = err;
            const field = path.slice(1);
            const customError = schema?.error?.toString();
            errors[field] = customError || message;
        }
        return Object.keys(errors).length > 0 ? errors : undefined;
    }

    return undefined;
}

function handleError(code: keyof typeof ELYSIA_ERRORS | number, error: unknown) {
    const status = getErrorStatus(code);
    const message = getErrorMessage(code);
    const errors = getErrorFields(error);

    if (status >= 500) {
        console.error(error);
    }

    return { code, message, errors };
}

export { handleError, ELYSIA_ERRORS, ERROR_CLASSES };
export {
    ParseError,
    BadRequestError,
    InvalidCookieSignatureError,
    UnauthorizedError,
    PaymentRequiredError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    GoneError,
    UnsupportedMediaTypeError,
    InvalidFileError,
    ValidationError,
    TooManyRequestsError,
    InternalServerError,
    UnknownError,
    ServiceUnavailableError,
};
