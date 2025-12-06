import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export interface ValidationResult {
    errors: string[];
    hasError: (message: string) => boolean;
    hasErrorContaining: (substring: string) => boolean;
    isValid: boolean;
}

export async function validateDto<T extends object>(dtoClass: new () => T, data: Partial<T>): Promise<ValidationResult> {
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
): Promise<void> {
    const result = await validateDto(dtoClass, { ...baseData, ...fieldOverride });

    expect(result.isValid).toBe(false);
    expect(result.hasError(expectedError)).toBe(true);
}

export async function expectValidationSuccess<T extends object>(dtoClass: new () => T, data: Partial<T>): Promise<void> {
    const result = await validateDto(dtoClass, data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
}

export interface ValidationTestCase<T> {
    description: string;
    override: Partial<T>;
    expectedError: string;
}

export function describeValidationRules<T extends object>(
    dtoClass: new () => T,
    baseData: Partial<T>,
    testCases: ValidationTestCase<T>[],
): void {
    describe.each(testCases)('$description', ({ override, expectedError }) => {
        it(`should fail with: "${expectedError}"`, async () => {
            await expectValidationError(dtoClass, baseData, override, expectedError);
        });
    });
}
