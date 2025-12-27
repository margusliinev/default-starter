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

type ElysiaErrorCode = keyof typeof ELYSIA_ERRORS;
type ElysiaErrorIssues = Record<string, string> | undefined;

function createElysiaError<T extends ElysiaErrorCode>(code: T) {
    const { status, message } = ELYSIA_ERRORS[code];
    return class extends Error {
        readonly code = code;
        readonly status = status;
        readonly issues?: ElysiaErrorIssues;

        constructor(issues?: ElysiaErrorIssues) {
            super(message);
            this.code = code;
            this.status = status;
            this.issues = issues;
        }
    };
}

const ParseError = createElysiaError('PARSE');
const BadRequestError = createElysiaError('BAD_REQUEST');
const InvalidCookieSignatureError = createElysiaError('INVALID_COOKIE_SIGNATURE');
const UnauthorizedError = createElysiaError('UNAUTHORIZED');
const PaymentRequiredError = createElysiaError('PAYMENT_REQUIRED');
const ForbiddenError = createElysiaError('FORBIDDEN');
const NotFoundError = createElysiaError('NOT_FOUND');
const ConflictError = createElysiaError('CONFLICT');
const GoneError = createElysiaError('GONE');
const UnsupportedMediaTypeError = createElysiaError('UNSUPPORTED_MEDIA_TYPE');
const InvalidFileError = createElysiaError('INVALID_FILE_TYPE');
const ValidationError = createElysiaError('VALIDATION');
const TooManyRequestsError = createElysiaError('TOO_MANY_REQUESTS');
const InternalServerError = createElysiaError('INTERNAL_SERVER_ERROR');
const UnknownError = createElysiaError('UNKNOWN');
const ServiceUnavailableError = createElysiaError('SERVICE_UNAVAILABLE');

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

function getErrorStatus(code: keyof typeof ELYSIA_ERRORS | number) {
    if (typeof code === 'number') return ELYSIA_ERRORS['UNKNOWN'].status;
    return ELYSIA_ERRORS[code].status;
}

function getErrorMessage(code: keyof typeof ELYSIA_ERRORS | number) {
    if (typeof code === 'number') return ELYSIA_ERRORS['UNKNOWN'].message;
    return ELYSIA_ERRORS[code].message;
}

function getIssues(error: unknown) {
    if (!error || typeof error !== 'object') {
        return undefined;
    }
    if ('issues' in error && error.issues) {
        return error.issues as ElysiaErrorIssues;
    }
    if ('all' in error && Array.isArray(error.all)) {
        const issues: ElysiaErrorIssues = {};
        for (const err of error.all) {
            if (!('path' in err)) continue;
            const { path, schema, message } = err;
            const field = path.slice(1);
            const customError = schema?.error?.toString();
            issues[field] = customError || message;
        }
        return Object.keys(issues).length > 0 ? issues : undefined;
    }

    return undefined;
}

function handleError(code: keyof typeof ELYSIA_ERRORS | number, error: unknown) {
    const status = getErrorStatus(code);
    const message = getErrorMessage(code);
    const issues = getIssues(error);

    if (status >= 500) {
        console.error(error);
    }

    return { code, message, issues };
}

export { handleError };
export { ELYSIA_ERRORS, ERROR_CLASSES };
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
