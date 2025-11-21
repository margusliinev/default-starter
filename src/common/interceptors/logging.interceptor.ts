import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url } = request;
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;
                const statusCode = response.statusCode;
                this.logger.log(`${method} ${url} - ${statusCode} (${duration}ms)`);
            }),
            catchError((error) => {
                const duration = Date.now() - start;
                const statusCode = error instanceof HttpException ? error.getStatus() : 500;
                if (400 <= statusCode && statusCode < 500) {
                    this.logger.warn(`${method} ${url} - ${statusCode} (${duration}ms)`);
                } else {
                    this.logger.error(`${method} ${url} - ${statusCode} (${duration}ms)`);
                }
                return throwError(() => error);
            }),
        );
    }
}
