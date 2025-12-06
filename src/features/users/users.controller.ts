import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { Session } from '../sessions/entities/session.entity';
import { UserResponseDto } from './dto/responses';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UserResponseDto, description: 'Get current authenticated user' })
    me(@Auth() session: Session): User {
        return session.user;
    }

    @Patch('me')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UserResponseDto, description: 'Update current authenticated user' })
    update(@Auth() session: Session, @Body() updateUserDto: UpdateUserDto): Promise<User | null> {
        return this.usersService.updateUser(session.user_id, updateUserDto);
    }

    @Delete('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'Delete current authenticated user' })
    remove(@Auth() session: Session): Promise<void> {
        return this.usersService.deleteUser(session.user_id);
    }
}
