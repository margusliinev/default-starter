// @ts-nocheck
import { expectValidationError, expectValidationSuccess, updateUserDto } from '../../../common/testing';
import { UpdateUserDto } from '../dto/update-user.dto';
import { faker } from '@faker-js/faker';

describe('UpdateUserDto', () => {
    const validData = updateUserDto();

    it('should pass validation with all fields', async () => {
        const data = updateUserDto();

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation with only name', async () => {
        const data = { name: faker.person.fullName() };

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation with only image', async () => {
        const data = { image: faker.image.avatar() };

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation with empty object', async () => {
        const data = {};

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation with minimum length name', async () => {
        const data = updateUserDto({ name: 'AB' });

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation with maximum length name', async () => {
        const data = updateUserDto({ name: 'A'.repeat(255) });

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should fail validation with name too short', async () => {
        await expectValidationError(UpdateUserDto, validData, { name: 'A' }, 'Name is too short');
    });

    it('should fail validation with name too long', async () => {
        await expectValidationError(UpdateUserDto, validData, { name: 'A'.repeat(256) }, 'Name is too long');
    });

    it('should fail validation when name is not a string', async () => {
        await expectValidationError(UpdateUserDto, validData, { name: 123 }, 'Name is invalid');
    });

    it('should pass validation when name is undefined', async () => {
        const data = { image: faker.image.avatar() };

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation when image is a valid string', async () => {
        const data = updateUserDto({ image: faker.image.avatar() });

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should pass validation when image is undefined', async () => {
        const data = { name: faker.person.fullName() };

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should fail validation when image is not a string', async () => {
        await expectValidationError(UpdateUserDto, validData, { image: 123 }, 'Image is invalid');
    });

    it('should fail validation when image is an array', async () => {
        await expectValidationError(UpdateUserDto, validData, { image: ['url1', 'url2'] }, 'Image is invalid');
    });

    it('should allow updating only name without image', async () => {
        const data = { name: faker.person.fullName() };

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should allow updating only image without name', async () => {
        const data = { image: faker.image.avatar() };

        await expectValidationSuccess(UpdateUserDto, data);
    });

    it('should ignore unknown fields', async () => {
        const data = {
            name: faker.person.fullName(),
            unknownField: 'should be ignored',
        };

        await expectValidationSuccess(UpdateUserDto, data);
    });
});
