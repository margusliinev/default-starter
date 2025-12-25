type ErrorCode = keyof typeof httpErrors;
type ErrorFields = Record<string, string>;

const httpErrors = {
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

function createError<T extends ErrorCode>(code: T) {
    const { status, message } = httpErrors[code];
    return class extends Error {
        readonly code = code;
        readonly status = status;
        readonly message = message;
        readonly errors?: ErrorFields;

        constructor(errors?: ErrorFields) {
            super(message);
            this.errors = errors;
        }
    };
}

export const errorClasses = (Object.keys(httpErrors) as ErrorCode[]).reduce(
    (acc, code) => ({ ...acc, [code]: createError(code) }),
    {} as { [K in ErrorCode]: ReturnType<typeof createError<K>> },
);

export const ParseError = errorClasses.PARSE;
export const BadRequestError = errorClasses.BAD_REQUEST;
export const InvalidCookieSignatureError = errorClasses.INVALID_COOKIE_SIGNATURE;
export const UnauthorizedError = errorClasses.UNAUTHORIZED;
export const PaymentRequiredError = errorClasses.PAYMENT_REQUIRED;
export const ForbiddenError = errorClasses.FORBIDDEN;
export const NotFoundError = errorClasses.NOT_FOUND;
export const ConflictError = errorClasses.CONFLICT;
export const GoneError = errorClasses.GONE;
export const UnsupportedMediaTypeError = errorClasses.UNSUPPORTED_MEDIA_TYPE;
export const InvalidFileError = errorClasses.INVALID_FILE_TYPE;
export const ValidationError = errorClasses.VALIDATION;
export const TooManyRequestsError = errorClasses.TOO_MANY_REQUESTS;
export const InternalServerError = errorClasses.INTERNAL_SERVER_ERROR;
export const UnknownError = errorClasses.UNKNOWN;
export const ServiceUnavailableError = errorClasses.SERVICE_UNAVAILABLE;

function getErrorMessage(code: ErrorCode | number) {
    if (typeof code === 'number') return httpErrors['UNKNOWN'].message;
    return httpErrors[code].message;
}

function getErrorFields(error: unknown) {
    if (!error || typeof error !== 'object') {
        return undefined;
    }
    if ('errors' in error && error.errors) {
        return error.errors as ErrorFields;
    }
    if ('all' in error && Array.isArray(error.all)) {
        const errors: ErrorFields = {};
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

export function handleError(code: ErrorCode | number, error: unknown) {
    const message = getErrorMessage(code);
    const errors = getErrorFields(error);
    return { code, message, errors };
}
