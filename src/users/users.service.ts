import { Injectable, Inject, InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/drizzle/drizzle.module';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { User, usersTable } from 'src/drizzle/schema';
import { and, eq, not } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@Inject(DATA_SOURCE) private db: DATA_SOURCE_TYPE) {}

    async getAllUsers() {
        const users = await this.db.query.usersTable.findMany();

        if (!users) throw new NotFoundException('No users found');

        const roleValues = {
            ADMIN: 3,
            DEVELOPER: 2,
            USER: 1,
        };

        users.sort((a, b) => roleValues[b.role] - roleValues[a.role]);

        return users;
    }

    async getCurrentUser(id: string) {
        const user = await this.db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });

        if (!user) throw new NotFoundException('No user found');

        return user;
    }

    async updateUserProfile(id: string, updateUserProfileDto: UpdateUserProfileDto) {
        const { username, email } = updateUserProfileDto;

        const existingUsername = await this.db.query.usersTable.findFirst({ where: and(eq(usersTable.username, username.toLowerCase()), not(eq(usersTable.id, id))) });
        if (existingUsername) throw new ConflictException('Username is already in use');

        const existingEmail = await this.db.query.usersTable.findFirst({ where: and(eq(usersTable.email, email.toLowerCase()), not(eq(usersTable.id, id))) });
        if (existingEmail) throw new ConflictException('Email is already in use');

        const updateData: Partial<User> = { username: username.toLowerCase(), email: email.toLowerCase() };

        const [user] = await this.db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
        if (!user) throw new InternalServerErrorException('Failed to update user profile');

        return user;
    }

    async updateUserPassword(id: string, updateUserPasswordDto: UpdateUserPasswordDto) {
        const { currentPassword, newPassword, confirmNewPassword } = updateUserPasswordDto;

        const user = await this.db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });
        if (!user) throw new NotFoundException('No user found');

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) throw new ConflictException('Current password is incorrect');

        if (newPassword !== confirmNewPassword) throw new ConflictException('Passwords do not match');

        const hash = await bcrypt.hash(newPassword, 10);

        const updatedUser = await this.db.update(usersTable).set({ password: hash }).where(eq(usersTable.id, id)).returning();
        if (!updatedUser) throw new InternalServerErrorException('Failed to update user password');

        return null;
    }

    async deleteUser(id: string) {
        const [user] = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();

        if (!user) throw new InternalServerErrorException('Failed to delete the user');

        return null;
    }
}
