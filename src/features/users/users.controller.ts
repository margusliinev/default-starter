import { Controller, Body, Patch, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthSession } from '../../common/decorators/auth-session';
import { Session } from '../sessions/entities/session.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @HttpCode(HttpStatus.OK)
    me(@AuthSession() session: Session) {
        return session.user;
    }

    @Patch('me')
    @HttpCode(HttpStatus.OK)
    async update(@AuthSession() session: Session, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.updateUser(session.user_id, updateUserDto);
    }

    @Delete('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@AuthSession() session: Session) {
        await this.usersService.deleteUser(session.user_id);
    }
}
