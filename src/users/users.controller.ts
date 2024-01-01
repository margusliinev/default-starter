import { Controller, Req, Body, Get, Patch, Put, Delete } from '@nestjs/common';
import { FileSystemStoredFile, FormDataRequest } from 'nestjs-form-data';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { AuthenticatedRequest } from 'src/types';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('me')
    getCurrentUser(@Req() req: AuthenticatedRequest) {
        return this.usersService.getCurrentUser(req.user.id);
    }

    @Patch('me')
    @FormDataRequest({ storage: FileSystemStoredFile, fileSystemStoragePath: './uploads' })
    updateUserProfile(@Req() req: AuthenticatedRequest, @Body() updateUserProfileDto: UpdateUserProfileDto) {
        return this.usersService.updateUserProfile(req.user.id, updateUserProfileDto);
    }

    @Put('me')
    updateUserPassword(@Req() req: AuthenticatedRequest, @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
        return this.usersService.updateUserPassword(req.user.id, updateUserPasswordDto);
    }

    @Delete('me')
    deleteUser(@Req() req: AuthenticatedRequest) {
        return this.usersService.deleteUser(req.user.id);
    }
}
