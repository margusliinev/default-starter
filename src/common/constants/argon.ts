import { Options } from '@node-rs/argon2';

export const ARGON2_OPTIONS: Options = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
};
