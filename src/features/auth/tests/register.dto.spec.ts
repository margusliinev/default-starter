// @ts-nocheck
import { expectValidationError, expectValidationSuccess, registerDto } from '../../../common/testing';
import { RegisterDto } from '../dto/register.dto';

describe('RegisterDto', () => {
    const validData = registerDto();

    it('passes with valid data', async () => {
        await expectValidationSuccess(RegisterDto, registerDto());
    });

    it('passes with boundary values', async () => {
        await expectValidationSuccess(RegisterDto, registerDto({ name: 'AB', password: 'Passwo1d' }));
        await expectValidationSuccess(RegisterDto, registerDto({ name: 'A'.repeat(255), password: 'A1' + 'a'.repeat(253) }));
    });

    it('fails with empty name', async () => {
        await expectValidationError(RegisterDto, validData, { name: '' }, 'Name is required');
    });

    it('fails with name too short', async () => {
        await expectValidationError(RegisterDto, validData, { name: 'A' }, 'Name must be at least 2 characters');
    });

    it('fails with name too long', async () => {
        await expectValidationError(RegisterDto, validData, { name: 'A'.repeat(256) }, 'Name must be at most 255 characters');
    });

    it('fails with non-string name', async () => {
        await expectValidationError(RegisterDto, validData, { name: 123 }, 'Name is invalid');
    });

    it('fails with empty email', async () => {
        await expectValidationError(RegisterDto, validData, { email: '' }, 'Email is required');
    });

    it('fails with invalid email', async () => {
        await expectValidationError(RegisterDto, validData, { email: 'invalid' }, 'Email is invalid');
    });

    it('fails with empty password', async () => {
        await expectValidationError(RegisterDto, validData, { password: '' }, 'Password is required');
    });

    it('fails with password too short', async () => {
        await expectValidationError(RegisterDto, validData, { password: 'Pass1' }, 'Password must be at least 8 characters');
    });

    it('fails with password too long', async () => {
        await expectValidationError(RegisterDto, validData, { password: 'A1' + 'a'.repeat(254) }, 'Password must be at most 255 characters');
    });

    it('fails with password without letter', async () => {
        await expectValidationError(RegisterDto, validData, { password: '12345678' }, 'Password must contain at least one letter');
    });

    it('fails with password without number', async () => {
        await expectValidationError(RegisterDto, validData, { password: 'Password' }, 'Password must contain at least one number');
    });

    it('fails with non-string password', async () => {
        await expectValidationError(RegisterDto, validData, { password: 123 }, 'Password is invalid');
    });
});
