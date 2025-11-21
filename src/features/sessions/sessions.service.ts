import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
    ) {}

    async findWithUser(id: Session['id']) {
        return await this.sessionRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }

    async create(userId: User['id'], createSessionDto: CreateSessionDto) {
        const session = this.sessionRepository.create({
            user_id: userId,
            ...createSessionDto,
        });
        return await this.sessionRepository.save(session);
    }

    async update(id: Session['id'], updateSessionDto: UpdateSessionDto) {
        await this.sessionRepository.update(id, updateSessionDto);
    }

    async remove(id: Session['id']) {
        await this.sessionRepository.delete(id);
    }

    async deleteExpiredSessions() {
        const result = await this.sessionRepository.delete({
            expires_at: LessThan(new Date()),
        });
        return result.affected || 0;
    }

    async deleteUserSessions(userId: User['id']) {
        const result = await this.sessionRepository.delete({
            user_id: userId,
        });
        return result.affected || 0;
    }
}
