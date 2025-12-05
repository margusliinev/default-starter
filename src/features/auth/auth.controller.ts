import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Session } from '../sessions/entities/session.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.register(registerDto, res);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(loginDto, res);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Auth() session: Session, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(session, res);
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    logoutAll(@Auth() session: Session, @Res({ passthrough: true }) res: Response) {
        return this.authService.logoutAll(session, res);
    }
}
