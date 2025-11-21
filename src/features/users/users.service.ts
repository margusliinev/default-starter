import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LessThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll() {
        return await this.userRepository.find();
    }

    async findById(id: User['id']) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async findByEmail(email: User['email']) {
        return await this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
    }

    async findByUsername(username: User['username']) {
        return await this.userRepository.createQueryBuilder('user').where('LOWER(user.username) = LOWER(:username)', { username }).getOne();
    }

    async create(createUserDto: CreateUserDto) {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    async update(id: User['id'], updateUserDto: UpdateUserDto) {
        return await this.userRepository.update(id, updateUserDto);
    }

    async remove(id: User['id']) {
        await this.userRepository.softDelete(id);
    }

    async deleteSoftDeletedUsers() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await this.userRepository.delete({
            deleted_at: LessThan(thirtyDaysAgo),
        });
        return result.affected || 0;
    }
}
