import { Injectable, Inject, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/drizzle/drizzle.module';
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

        const newUser = await this.db
            .insert(usersTable)
            .values({ ...createUserDto, password: hash })
            .returning();
        if (!newUser[0]) throw new InternalServerErrorException();

        return newUser[0];
    }

    async findAll() {
        const users = await this.db.query.usersTable.findMany();
        return users;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        console.log(updateUserDto);
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
