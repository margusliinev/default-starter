import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/drizzle/drizzle.module';

@Injectable()
export class UsersService {
    constructor(@Inject(DATA_SOURCE) private db: DATA_SOURCE_TYPE) {}

    create(createUserDto: CreateUserDto) {
        console.log(createUserDto);
        return 'This action adds a new user';
    }

    async findAll() {
        const users = await this.db.query.users.findMany();
        return { users };
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
