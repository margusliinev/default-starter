import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { SessionsService } from '../sessions/sessions.service';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly sessionsService: SessionsService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const token = this.sessionsService.getSessionTokenFromCookie(request);
        if (!token) {
            return false;
        }

        const session = await this.sessionsService.validateSessionToken(token);
        if (!session) {
            this.sessionsService.clearSessionCookie(response);
            return false;
        }

        this.sessionsService.setSessionCookie(response, token, session.expires_at);
        request.session = session;

        return true;
    }
}
