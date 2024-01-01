import type { AuthenticatedRequest } from 'src/types';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DATA_SOURCE, DATA_SOURCE_TYPE } from 'src/drizzle/drizzle.provider';
import { Session, sessionsTable, usersTable } from 'src/drizzle/schema';
import { and, eq, gt } from 'drizzle-orm';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(DATA_SOURCE) private db: DATA_SOURCE_TYPE,
        private reflector: Reflector,
    ) {}

    private async getUserBySessionId(sessionId: Session['id']) {
        const session = await this.db.query.sessionsTable.findFirst({
            columns: {},
            with: { user: { columns: { id: true } } },
            where: and(eq(usersTable.id, sessionId), gt(sessionsTable.expires_at, new Date())),
        });

        return session?.user;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const publicRoute = this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()]);
        if (publicRoute) return true;

        const request: AuthenticatedRequest = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        const cookies = request.signedCookies as { [key: string]: string };
        const sessionId = cookies['__session'];
        if (!sessionId) throw new UnauthorizedException('Unauthorized');

        const user = await this.getUserBySessionId(sessionId);
        if (!user) {
            response.clearCookie('__session');
            throw new UnauthorizedException('Unauthorized');
        }

        request.user = user;

        return true;
    }
}
