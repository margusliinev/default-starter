import { createSessionCookie, deleteSessionCookie, getSessionFromCookie } from './auth.helpers';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    private getIsProduction() {
        return this.configService.get('NODE_ENV') === 'production';
    }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const isProduction = this.getIsProduction();

        const sessionId = getSessionFromCookie(request);
        if (!sessionId) {
            return false;
        }

        const session = await this.authService.validateSession(sessionId);
        if (!session) {
            deleteSessionCookie(response, isProduction);
            return false;
        }

        createSessionCookie(response, sessionId, session.expires_at, isProduction);

        request.user = plainToInstance(User, session.user);

        return true;
    }
}
