import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { Session } from '../sessions/entities/session.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @HttpCode(HttpStatus.OK)
    get(@Auth() session: Session) {
        return session.user;
    }

    @Patch('me')
    @HttpCode(HttpStatus.OK)
    update(@Auth() session: Session, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(session.user_id, updateUserDto);
    }

    @Delete('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Auth() session: Session) {
        return this.usersService.deleteUser(session.user_id);
    }
}
