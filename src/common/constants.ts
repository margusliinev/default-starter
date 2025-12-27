const SESSION = {
    DURATION_IN_MS: 1000 * 60 * 60 * 24 * 30,
    RENEWAL_THRESHOLD_IN_MS: 1000 * 60 * 60 * 24 * 15,
} as const;

const OAUTH = {
    DURATION_IN_MS: 1000 * 60 * 10,
} as const;

export { SESSION, OAUTH };
