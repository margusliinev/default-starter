// @ts-nocheck
import { expectValidationError, expectValidationSuccess, updateUserDto } from '../../../common/testing';
import { UpdateUserDto } from '../dto/update-user.dto';
import { faker } from '@faker-js/faker';

describe('UpdateUserDto', () => {
    const validData = updateUserDto();

    it('passes with valid data', async () => {
        await expectValidationSuccess(UpdateUserDto, updateUserDto());
    });

    it('passes with partial data', async () => {
        await expectValidationSuccess(UpdateUserDto, { name: faker.person.fullName() });
        await expectValidationSuccess(UpdateUserDto, { image: faker.image.avatar() });
        await expectValidationSuccess(UpdateUserDto, {});
    });

    it('passes with boundary name lengths', async () => {
        await expectValidationSuccess(UpdateUserDto, updateUserDto({ name: 'AB' }));
        await expectValidationSuccess(UpdateUserDto, updateUserDto({ name: 'A'.repeat(255) }));
    });

    it('fails with name too short', async () => {
        await expectValidationError(UpdateUserDto, validData, { name: 'A' }, 'Name is too short');
    });

    it('fails with name too long', async () => {
        await expectValidationError(UpdateUserDto, validData, { name: 'A'.repeat(256) }, 'Name is too long');
    });

    it('fails with non-string name', async () => {
        await expectValidationError(UpdateUserDto, validData, { name: 123 }, 'Name is invalid');
    });

    it('fails with non-string image', async () => {
        await expectValidationError(UpdateUserDto, validData, { image: 123 }, 'Image is invalid');
    });
});
