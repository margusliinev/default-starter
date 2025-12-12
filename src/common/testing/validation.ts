import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export interface ValidationResult {
    errors: string[];
    hasError: (message: string) => boolean;
    hasErrorContaining: (substring: string) => boolean;
    isValid: boolean;
}

async function validateDto<T extends object>(dtoClass: new () => T, data: Partial<T>) {
    const instance = plainToInstance(dtoClass, data);
    const validationErrors = await validate(instance);

    const errors = validationErrors.flatMap((error) => Object.values(error.constraints || {}));

    return {
        errors,
        hasError: (message: string) => errors.includes(message),
        hasErrorContaining: (substring: string) => errors.some((e) => e.includes(substring)),
        isValid: errors.length === 0,
    };
}

export async function expectValidationError<T extends object>(
    dtoClass: new () => T,
    baseData: Partial<T>,
    fieldOverride: Partial<T>,
    expectedError: string,
) {
    const result = await validateDto(dtoClass, { ...baseData, ...fieldOverride });

    expect(result.isValid).toBe(false);
    expect(result.hasError(expectedError)).toBe(true);
}

export async function expectValidationSuccess<T extends object>(dtoClass: new () => T, data: Partial<T>) {
    const result = await validateDto(dtoClass, data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
}
