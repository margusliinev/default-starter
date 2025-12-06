import { CreateUserDto } from '../../features/users/dto/create-user.dto';
import { UpdateUserDto } from '../../features/users/dto/update-user.dto';
import { RegisterDto } from '../../features/auth/dto/register.dto';
import { LoginDto } from '../../features/auth/dto/login.dto';
import { Account } from '../../features/accounts/entities/account.entity';
import { Session } from '../../features/sessions/entities/session.entity';
import { User } from '../../features/users/entities/user.entity';
import { Provider } from '../enums/provider';
import { faker } from '@faker-js/faker';

export function createUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        image: null,
        email_verified_at: null,
        ...overrides,
    };
}

export function updateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
    return {
        name: faker.person.fullName(),
        image: faker.image.avatar(),
        ...overrides,
    };
}

export function createMockUser(overrides: Partial<User> = {}): User {
    const now = new Date();
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        image: null,
        email_verified_at: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

export function createMockAccount(overrides: Partial<Account> = {}): Account {
    const now = new Date();
    return {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        provider: Provider.PASSWORD,
        provider_id: null,
        password: faker.internet.password(),
        created_at: now,
        updated_at: now,
        user: createMockUser(),
        ...overrides,
    };
}

export function createMockSession(overrides: Partial<Session> = {}): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        token: faker.string.alphanumeric(64),
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
        user: createMockUser(),
        ...overrides,
    };
}

export function loginDto(overrides: Partial<LoginDto> = {}): LoginDto {
    return {
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 10 }) + 'A1',
        ...overrides,
    };
}

export function registerDto(overrides: Partial<RegisterDto> = {}): RegisterDto {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 10 }) + 'A1',
        ...overrides,
    };
}
