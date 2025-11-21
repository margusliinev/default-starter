import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponse {
    errors?: Record<string, string>;
    message?: string;
}

@Catch()
export class CatchAllFilter implements ExceptionFilter {
    private readonly logger = new Logger(CatchAllFilter.name);

    private readonly exceptions: Record<string, string> = {
        BadRequestException: 'Bad Request',
        UnauthorizedException: 'Unauthorized',
        ForbiddenException: 'Forbidden',
        NotFoundException: 'Not Found',
        RequestTimeoutException: 'Request Timeout',
        ConflictException: 'Conflict',
        ThrottlerException: 'Too Many Requests',
        UnprocessableEntityException: 'Unprocessable Entity',
        InternalServerErrorException: 'Internal Server Error',
    };

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const message = this.getErrorMessage(exception);
            const { errors } = exception.getResponse() as ExceptionResponse;

            if (status >= 500) {
                this.logger.error(exception);
            }

            response.status(status).json({
                success: false,
                message,
                errors,
            });
        } else {
            const status = HttpStatus.INTERNAL_SERVER_ERROR;
            const message = 'Internal Server Error';

            this.logger.error(exception);

            response.status(status).json({
                success: false,
                message,
            });
        }
    }

    private getErrorMessage(exception: HttpException): string {
        return this.exceptions[exception.constructor.name] || 'Internal Server Error';
    }
}
