// @ts-nocheck
import { faker } from '@faker-js/faker';
import { createUserDto, expectValidationError, expectValidationSuccess } from '../../../common/testing';
import { CreateUserDto } from '../dto/create-user.dto';

describe('CreateUserDto', () => {
    const validData = createUserDto();

    it('should pass validation with all required fields', async () => {
        const data = createUserDto();

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation with optional fields as null', async () => {
        const data = createUserDto({
            image: null,
            email_verified_at: null,
        });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation with all fields populated', async () => {
        const data = createUserDto({
            name: faker.person.fullName(),
            email: faker.internet.email().toLowerCase(),
            image: faker.image.avatar(),
            email_verified_at: new Date(),
        });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation with minimum length name', async () => {
        const data = createUserDto({ name: 'AB' });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation with maximum length name', async () => {
        const data = createUserDto({ name: 'A'.repeat(255) });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should fail validation with empty name', async () => {
        await expectValidationError(CreateUserDto, validData, { name: '' }, 'Name is required');
    });

    it('should fail validation with name too short', async () => {
        await expectValidationError(CreateUserDto, validData, { name: 'A' }, 'Name is too short');
    });

    it('should fail validation with name too long', async () => {
        await expectValidationError(CreateUserDto, validData, { name: 'A'.repeat(256) }, 'Name is too long');
    });

    it('should fail validation when name is not a string', async () => {
        await expectValidationError(CreateUserDto, validData, { name: 123 }, 'Name is invalid');
    });

    it('should fail validation when name is undefined', async () => {
        await expectValidationError(CreateUserDto, validData, { name: undefined }, 'Name is required');
    });

    it('should fail validation with empty email', async () => {
        await expectValidationError(CreateUserDto, validData, { email: '' }, 'Email is required');
    });

    it('should fail validation with invalid email format', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'invalid-email' }, 'Email is invalid');
    });

    it('should fail validation with uppercase email', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'John@Example.com' }, 'Email must be lowercase');
    });

    it('should fail validation when email is missing @ symbol', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'johndoe.example.com' }, 'Email is invalid');
    });

    it('should fail validation when email is missing domain', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'johndoe@' }, 'Email is invalid');
    });

    it('should fail validation when email has spaces', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'john doe@example.com' }, 'Email is invalid');
    });

    it('should pass validation when image is a valid string', async () => {
        const data = createUserDto({ image: faker.image.avatar() });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation when image is null', async () => {
        const data = createUserDto({ image: null });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation when image is undefined', async () => {
        const { image, ...dataWithoutImage } = createUserDto();

        await expectValidationSuccess(CreateUserDto, dataWithoutImage);
    });

    it('should fail validation when image is not a string', async () => {
        await expectValidationError(CreateUserDto, validData, { image: 123 }, 'Image is invalid');
    });

    it('should pass validation when email_verified_at is a valid date', async () => {
        const data = createUserDto({ email_verified_at: new Date() });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation when email_verified_at is null', async () => {
        const data = createUserDto({ email_verified_at: null });

        await expectValidationSuccess(CreateUserDto, data);
    });

    it('should pass validation when email_verified_at is undefined', async () => {
        const { email_verified_at, ...dataWithoutVerified } = createUserDto();

        await expectValidationSuccess(CreateUserDto, dataWithoutVerified);
    });

    it('should fail validation when email_verified_at is not a date', async () => {
        await expectValidationError(CreateUserDto, validData, { email_verified_at: 'not-a-date' }, 'Email verified date is invalid');
    });
});
