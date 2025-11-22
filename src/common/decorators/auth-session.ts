import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Session } from '../../features/sessions/entities/session.entity';

export const AuthSession = createParamDecorator((_data: unknown, ctx: ExecutionContext): Session => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
});
