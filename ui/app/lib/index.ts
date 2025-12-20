class ApiError extends Error {
    status: number;
    errors?: Record<string, string>;

    constructor(status: number, message: string, errors?: Record<string, string>) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `/api${path.startsWith('/') ? path : `/${path}`}`;

    const config: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    };

    if (body !== undefined) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const result = await response.json();

    if (!result.success) {
        throw new ApiError(response.status, result.message, result.errors);
    }

    return result.data;
}

export const api = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
};
