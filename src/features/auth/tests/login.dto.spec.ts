// @ts-nocheck
import { expectValidationError, expectValidationSuccess, loginDto } from '../../../common/testing';
import { LoginDto } from '../dto/login.dto';

describe('LoginDto', () => {
    const validData = loginDto();

    it('should pass validation with valid email and password', async () => {
        const data = loginDto();

        await expectValidationSuccess(LoginDto, data);
    });

    it('should pass validation with any password format', async () => {
        const data = loginDto({ password: 'anypassword' });

        await expectValidationSuccess(LoginDto, data);
    });

    it('should fail validation with empty email', async () => {
        await expectValidationError(LoginDto, validData, { email: '' }, 'Email is required');
    });

    it('should fail validation with invalid email format', async () => {
        await expectValidationError(LoginDto, validData, { email: 'invalid-email' }, 'Email is invalid');
    });

    it('should fail validation when email is missing @ symbol', async () => {
        await expectValidationError(LoginDto, validData, { email: 'test.example.com' }, 'Email is invalid');
    });

    it('should fail validation when email is missing domain', async () => {
        await expectValidationError(LoginDto, validData, { email: 'test@' }, 'Email is invalid');
    });

    it('should fail validation with empty password', async () => {
        await expectValidationError(LoginDto, validData, { password: '' }, 'Password is required');
    });

    it('should fail validation when password is not a string', async () => {
        await expectValidationError(LoginDto, validData, { password: 123 }, 'Password is invalid');
    });

    it('should fail validation when email is not a string', async () => {
        await expectValidationError(LoginDto, validData, { email: 123 }, 'Email is invalid');
    });

    it('should pass validation with lowercase email', async () => {
        const data = loginDto({ email: 'test@example.com' });

        await expectValidationSuccess(LoginDto, data);
    });

    it('should pass validation with uppercase email', async () => {
        const data = loginDto({ email: 'TEST@EXAMPLE.COM' });

        await expectValidationSuccess(LoginDto, data);
    });

    it('should pass validation with short password', async () => {
        const data = loginDto({ password: 'a' });

        await expectValidationSuccess(LoginDto, data);
    });
});
