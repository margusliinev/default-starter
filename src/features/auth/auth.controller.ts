import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Provider } from '../../common/enums/provider';
import { Session } from '../sessions/entities/session.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OAuthService } from './oauth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly oauthService: OAuthService,
    ) {}

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

    @Public()
    @Get('google')
    googleAuth(@Res() res: Response) {
        const state = this.oauthService.setStateCookie(res);
        const authUrl = this.oauthService.getGoogleAuthUrl(state);
        return res.redirect(authUrl);
    }

    @Public()
    @Get('google/callback')
    async googleCallback(
        @Query('error') error: string,
        @Query('state') state: string,
        @Query('code') code: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        this.oauthService.clearStateCookie(res);

        if (error) {
            return this.oauthService.redirectToError(res, error);
        }

        if (!this.oauthService.validateState(req, state)) {
            throw new UnauthorizedException('Invalid state parameter');
        }

        const userInfo = await this.oauthService.getOAuthUserInfo(Provider.GOOGLE, code);
        return this.authService.handleOAuthCallback(Provider.GOOGLE, userInfo, res);
    }

    @Public()
    @Get('github')
    githubAuth(@Res() res: Response) {
        const state = this.oauthService.setStateCookie(res);
        const authUrl = this.oauthService.getGitHubAuthUrl(state);
        return res.redirect(authUrl);
    }

    @Public()
    @Get('github/callback')
    async githubCallback(
        @Query('error') error: string,
        @Query('state') state: string,
        @Query('code') code: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        this.oauthService.clearStateCookie(res);

        if (error) {
            return this.oauthService.redirectToError(res, error);
        }

        if (!this.oauthService.validateState(req, state)) {
            throw new UnauthorizedException('Invalid state parameter');
        }

        const userInfo = await this.oauthService.getOAuthUserInfo(Provider.GITHUB, code);
        return this.authService.handleOAuthCallback(Provider.GITHUB, userInfo, res);
    }
}
