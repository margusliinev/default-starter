import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

interface ExceptionBody {
    message: string;
    fields?: Record<string, string>;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const { message, fields }: ExceptionBody = exception.getResponse() as ExceptionBody;

        response.status(status).json({
            success: false,
            status: status || 500,
            message: message || 'Internal Server Error',
            fields: fields ? fields : null,
        });
    }
}
