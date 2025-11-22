import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { AuthSession } from '../../common/decorators/auth-session';
import { Public } from '../../common/decorators/public.decorator';
import { Session } from '../sessions/entities/session.entity';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionsService: SessionsService,
    ) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { token, expiresAt } = await this.authService.register(registerDto);

        this.sessionsService.createSessionCookie(res, token, expiresAt);
        return 'Registration successful';
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { token, expiresAt } = await this.authService.login(loginDto);

        this.sessionsService.createSessionCookie(res, token, expiresAt);
        return 'Login successful';
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@AuthSession() session: Session, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(session);

        this.sessionsService.deleteSessionCookie(res);
        return 'Logout successful';
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    async logoutAll(@AuthSession() session: Session, @Res({ passthrough: true }) res: Response) {
        await this.authService.logoutAll(session);

        this.sessionsService.deleteSessionCookie(res);
        return 'Logout all successful';
    }
}
