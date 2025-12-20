// @ts-nocheck
import { createUserDto, expectValidationError, expectValidationSuccess } from '../../../common/testing';
import { CreateUserDto } from '../dto/create-user.dto';
import { faker } from '@faker-js/faker';

describe('CreateUserDto', () => {
    const validData = createUserDto();

    it('passes with valid data', async () => {
        await expectValidationSuccess(CreateUserDto, createUserDto());
    });

    it('passes with all fields populated', async () => {
        await expectValidationSuccess(CreateUserDto, createUserDto({ image: faker.image.avatar(), email_verified_at: new Date() }));
    });

    it('passes with boundary name lengths', async () => {
        await expectValidationSuccess(CreateUserDto, createUserDto({ name: 'AB' }));
        await expectValidationSuccess(CreateUserDto, createUserDto({ name: 'A'.repeat(255) }));
    });

    it('fails with empty name', async () => {
        await expectValidationError(CreateUserDto, validData, { name: '' }, 'Name is required');
    });

    it('fails with name too short', async () => {
        await expectValidationError(CreateUserDto, validData, { name: 'A' }, 'Name is too short');
    });

    it('fails with name too long', async () => {
        await expectValidationError(CreateUserDto, validData, { name: 'A'.repeat(256) }, 'Name is too long');
    });

    it('fails with non-string name', async () => {
        await expectValidationError(CreateUserDto, validData, { name: 123 }, 'Name is invalid');
    });

    it('fails with empty email', async () => {
        await expectValidationError(CreateUserDto, validData, { email: '' }, 'Email is required');
    });

    it('fails with invalid email', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'invalid' }, 'Email is invalid');
    });

    it('fails with uppercase email', async () => {
        await expectValidationError(CreateUserDto, validData, { email: 'John@Example.com' }, 'Email must be lowercase');
    });

    it('fails with non-string image', async () => {
        await expectValidationError(CreateUserDto, validData, { image: 123 }, 'Image is invalid');
    });

    it('fails with invalid email_verified_at', async () => {
        await expectValidationError(CreateUserDto, validData, { email_verified_at: 'not-a-date' }, 'Email verified date is invalid');
    });
});
