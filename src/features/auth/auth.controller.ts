import { createSessionCookie, deleteSessionCookie, getSessionFromCookie } from './auth.helpers';
import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { AuthUser } from '../../common/decorators/auth-user';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    private getIsProduction() {
        return this.configService.get('NODE_ENV') === 'production';
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.register(registerDto);
        const session = await this.authService.createSession(user.id);

        const isProduction = this.getIsProduction();
        createSessionCookie(res, session.id, session.expires_at, isProduction);

        return user;
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.login(loginDto);
        const session = await this.authService.createSession(user.id);

        const isProduction = this.getIsProduction();
        createSessionCookie(res, session.id, session.expires_at, isProduction);

        return user;
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const sessionId = getSessionFromCookie(req);
        if (sessionId) {
            await this.authService.logout(sessionId);
        }

        const isProduction = this.getIsProduction();
        deleteSessionCookie(res, isProduction);
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logoutAllDevices(@AuthUser() user: User, @Res({ passthrough: true }) res: Response) {
        await this.authService.logoutAllDevices(user.id);

        const isProduction = this.getIsProduction();
        deleteSessionCookie(res, isProduction);
    }
}
