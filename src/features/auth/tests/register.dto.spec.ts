// @ts-nocheck
import { expectValidationError, expectValidationSuccess, registerDto } from '../../../common/testing';
import { RegisterDto } from '../dto/register.dto';

describe('RegisterDto', () => {
    const validData = registerDto();

    it('should pass validation with valid data', async () => {
        const data = registerDto();

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with minimum length name', async () => {
        const data = registerDto({ name: 'AB' });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with maximum length name', async () => {
        const data = registerDto({ name: 'A'.repeat(255) });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with minimum length password', async () => {
        const data = registerDto({ password: 'Passwo1d' });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with maximum length password', async () => {
        const data = registerDto({ password: 'A1' + 'a'.repeat(253) });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should fail validation with empty name', async () => {
        await expectValidationError(RegisterDto, validData, { name: '' }, 'Name is required');
    });

    it('should fail validation with name too short', async () => {
        await expectValidationError(RegisterDto, validData, { name: 'A' }, 'Name must be at least 2 characters');
    });

    it('should fail validation with name too long', async () => {
        await expectValidationError(RegisterDto, validData, { name: 'A'.repeat(256) }, 'Name must be at most 255 characters');
    });

    it('should fail validation when name is not a string', async () => {
        await expectValidationError(RegisterDto, validData, { name: 123 }, 'Name is invalid');
    });

    it('should fail validation with empty email', async () => {
        await expectValidationError(RegisterDto, validData, { email: '' }, 'Email is required');
    });

    it('should fail validation with invalid email format', async () => {
        await expectValidationError(RegisterDto, validData, { email: 'invalid-email' }, 'Email is invalid');
    });

    it('should fail validation when email is missing @ symbol', async () => {
        await expectValidationError(RegisterDto, validData, { email: 'test.example.com' }, 'Email is invalid');
    });

    it('should fail validation with empty password', async () => {
        await expectValidationError(RegisterDto, validData, { password: '' }, 'Password is required');
    });

    it('should fail validation with password too short', async () => {
        await expectValidationError(RegisterDto, validData, { password: 'Pass1' }, 'Password must be at least 8 characters');
    });

    it('should fail validation with password too long', async () => {
        await expectValidationError(
            RegisterDto,
            validData,
            { password: 'A1' + 'a'.repeat(254) },
            'Password must be at most 255 characters',
        );
    });

    it('should fail validation with password without letter', async () => {
        await expectValidationError(RegisterDto, validData, { password: '12345678' }, 'Password must contain at least one letter');
    });

    it('should fail validation with password without number', async () => {
        await expectValidationError(RegisterDto, validData, { password: 'Password' }, 'Password must contain at least one number');
    });

    it('should fail validation when password is not a string', async () => {
        await expectValidationError(RegisterDto, validData, { password: 123 }, 'Password is invalid');
    });

    it('should pass validation with password containing special characters', async () => {
        const data = registerDto({ password: 'Password1!' });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with password containing uppercase and lowercase', async () => {
        const data = registerDto({ password: 'PassWord123' });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with only lowercase letter and number', async () => {
        const data = registerDto({ password: 'password1' });

        await expectValidationSuccess(RegisterDto, data);
    });

    it('should pass validation with only uppercase letter and number', async () => {
        const data = registerDto({ password: 'PASSWORD1' });

        await expectValidationSuccess(RegisterDto, data);
    });
});
