type ApiRoutes = {
    GET: '/health' | '/users/me';
    POST: '/register' | '/login' | '/logout' | '/logout-all';
    PATCH: '/users/me';
    DELETE: '/users/me';
};

type RequestOptions = Omit<RequestInit, 'method' | 'body'> & {
    params?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
};

type SuccessResponse<T> = {
    success: true;
    data: T;
};

type ErrorResponse = {
    success: false;
    message: string;
    errors?: Record<string, string>;
};

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

class ApiError extends Error {
    status: number;
    errors?: Record<string, string>;

    constructor(status: number, message: string, errors?: Record<string, string>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: customHeaders, ...restOptions } = options;

    let url = path.startsWith('http') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;

    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) url += `${url.includes('?') ? '&' : '?'}${queryString}`;
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    const config: RequestInit = {
        method,
        headers,
        credentials: 'include',
        ...restOptions,
    };

    if (body !== undefined && !['GET', 'HEAD'].includes(method)) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
        throw new ApiError(response.status, result.message, result.errors);
    }

    return result.data;
}

export const api = {
    get: <T>(path: ApiRoutes['GET'], options?: RequestOptions) => request<T>('GET', path, options),
    post: <T>(path: ApiRoutes['POST'], options?: RequestOptions) => request<T>('POST', path, options),
    patch: <T>(path: ApiRoutes['PATCH'], options?: RequestOptions) => request<T>('PATCH', path, options),
    delete: <T>(path: ApiRoutes['DELETE'], options?: RequestOptions) => request<T>('DELETE', path, options),
};
