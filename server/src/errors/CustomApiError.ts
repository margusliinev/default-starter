class CustomAPIError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export { CustomAPIError };
