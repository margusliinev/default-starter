import { Injectable, Inject, InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/drizzle/drizzle.module';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { usersTable } from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@Inject(DATA_SOURCE) private db: DATA_SOURCE_TYPE) {}

    async create(createUserDto: CreateUserDto) {
        const existingUsername = await this.db.query.usersTable.findFirst({ where: eq(usersTable.username, createUserDto.username) });
        if (existingUsername) throw new ConflictException('Username is already in use');

        const existingEmail = await this.db.query.usersTable.findFirst({ where: eq(usersTable.email, createUserDto.email) });
        if (existingEmail) throw new ConflictException('Email is already in use');

        const hash = await bcrypt.hash(createUserDto.password, 10);

        const [user] = await this.db
            .insert(usersTable)
            .values({ ...createUserDto, password: hash })
            .returning();

        if (!user) throw new InternalServerErrorException('Failed to create new user');

        return user;
    }

    async findAll() {
        const users = await this.db.query.usersTable.findMany();

        if (!users) throw new NotFoundException('No users found');

        return users;
    }

    async findOne(id: string) {
        const user = await this.db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });

        if (!user) throw new NotFoundException('No user found');

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const [user] = await this.db.update(usersTable).set(updateUserDto).where(eq(usersTable.id, id)).returning();

        if (!user) throw new InternalServerErrorException('Failed to update the user');

        return user;
    }

    async remove(id: string) {
        const [user] = await this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();

        if (!user) throw new InternalServerErrorException('Failed to delete the user');

        return null;
    }
}
