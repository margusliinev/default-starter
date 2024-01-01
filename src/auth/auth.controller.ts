import type { AuthenticatedRequest } from 'src/types';
import { Controller, Post, Body, Res, Req, Delete } from '@nestjs/common';
import { Public } from 'src/utils/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    private readonly COOKIE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7;

    private setAuthCookie(res: Response, sessionId: string) {
        res.cookie('__session', sessionId, {
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + this.COOKIE_EXPIRATION_TIME),
            signed: true,
        });
    }

    @Post('register')
    @Public()
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { session } = await this.authService.register(registerDto);
        this.setAuthCookie(res, session.id);
        return null;
    }

    @Post('login')
    @Public()
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { session } = await this.authService.login(loginDto);
        this.setAuthCookie(res, session.id);
        return null;
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('__session');
        return null;
    }

    @Delete('revoke')
    revoke(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
        res.clearCookie('__session');
        return this.authService.revoke(req.user.id);
    }
}
