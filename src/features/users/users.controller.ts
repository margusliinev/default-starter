import { Controller, Body, Patch, Delete, Get, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/auth-user';
import { deleteSessionCookie } from '../auth/auth.helpers';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {}

    @Get('me')
    @HttpCode(HttpStatus.OK)
    me(@AuthUser() user: User) {
        return user;
    }

    @Patch('me')
    @HttpCode(HttpStatus.OK)
    async update(@AuthUser() user: User, @Body() updateUserDto: UpdateUserDto) {
        await this.usersService.update(user.id, updateUserDto);

        return await this.usersService.findById(user.id);
    }

    @Delete('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@AuthUser() user: User, @Res({ passthrough: true }) res: Response) {
        await this.usersService.remove(user.id);

        const isProduction = this.configService.get('NODE_ENV') === 'production';
        deleteSessionCookie(res, isProduction);
    }
}
