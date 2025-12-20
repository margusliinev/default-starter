// @ts-nocheck
import { expectValidationError, expectValidationSuccess, loginDto } from '../../../common/testing';
import { LoginDto } from '../dto/login.dto';

describe('LoginDto', () => {
    const validData = loginDto();

    it('passes with valid data', async () => {
        await expectValidationSuccess(LoginDto, loginDto());
    });

    it('fails with empty email', async () => {
        await expectValidationError(LoginDto, validData, { email: '' }, 'Email is required');
    });

    it('fails with invalid email', async () => {
        await expectValidationError(LoginDto, validData, { email: 'invalid' }, 'Email is invalid');
    });

    it('fails with non-string email', async () => {
        await expectValidationError(LoginDto, validData, { email: 123 }, 'Email is invalid');
    });

    it('fails with empty password', async () => {
        await expectValidationError(LoginDto, validData, { password: '' }, 'Password is required');
    });

    it('fails with non-string password', async () => {
        await expectValidationError(LoginDto, validData, { password: 123 }, 'Password is invalid');
    });
});
