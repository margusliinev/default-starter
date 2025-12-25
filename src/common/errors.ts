import { ELYSIA_ERRORS } from './constants';

type ErrorCode = keyof typeof ELYSIA_ERRORS;
type ErrorFields = Record<string, string>;

function createError<T extends ErrorCode>(code: T) {
    const { status, message } = ELYSIA_ERRORS[code];
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

const errorClasses = (Object.keys(ELYSIA_ERRORS) as ErrorCode[]).reduce(
    (acc, code) => ({ ...acc, [code]: createError(code) }),
    {} as { [K in ErrorCode]: ReturnType<typeof createError<K>> },
);

const ParseError = errorClasses.PARSE;
const BadRequestError = errorClasses.BAD_REQUEST;
const InvalidCookieSignatureError = errorClasses.INVALID_COOKIE_SIGNATURE;
const UnauthorizedError = errorClasses.UNAUTHORIZED;
const PaymentRequiredError = errorClasses.PAYMENT_REQUIRED;
const ForbiddenError = errorClasses.FORBIDDEN;
const NotFoundError = errorClasses.NOT_FOUND;
const ConflictError = errorClasses.CONFLICT;
const GoneError = errorClasses.GONE;
const UnsupportedMediaTypeError = errorClasses.UNSUPPORTED_MEDIA_TYPE;
const InvalidFileError = errorClasses.INVALID_FILE_TYPE;
const ValidationError = errorClasses.VALIDATION;
const TooManyRequestsError = errorClasses.TOO_MANY_REQUESTS;
const InternalServerError = errorClasses.INTERNAL_SERVER_ERROR;
const UnknownError = errorClasses.UNKNOWN;
const ServiceUnavailableError = errorClasses.SERVICE_UNAVAILABLE;

function getStatusFromCode(code: ErrorCode | number) {
    if (typeof code === 'number') return ELYSIA_ERRORS['UNKNOWN'].status;
    return ELYSIA_ERRORS[code].status;
}

function getErrorMessage(code: ErrorCode | number) {
    if (typeof code === 'number') return ELYSIA_ERRORS['UNKNOWN'].message;
    return ELYSIA_ERRORS[code].message;
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

function handleError(code: ErrorCode | number, error: unknown) {
    const status = getStatusFromCode(code);
    const message = getErrorMessage(code);
    const errors = getErrorFields(error);

    if (status >= 500) {
        console.error(error);
    }

    return { code, message, errors };
}

export { errorClasses };
export { handleError };
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
