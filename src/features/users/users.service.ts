import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private getRepository(manager?: EntityManager) {
        return manager ? manager.getRepository(User) : this.userRepository;
    }

    async findUserById(id: User['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        return await repo.findOne({ where: { id } });
    }

    async findUserByEmail(email: User['email'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        return await repo.findOne({ where: { email } });
    }

    async createUser(createUserDto: CreateUserDto, manager?: EntityManager) {
        const repo = this.getRepository(manager);
        const user = repo.create(createUserDto);
        return await repo.save(user);
    }

    async updateUser(id: User['id'], updateUserDto: UpdateUserDto, manager?: EntityManager) {
        const repo = this.getRepository(manager);
        await repo.update(id, updateUserDto);
        return await repo.findOne({ where: { id } });
    }

    async deleteUser(id: User['id'], manager?: EntityManager) {
        const repo = this.getRepository(manager);
        await repo.delete(id);
    }
}
