/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/drizzle/schema';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    private exclude(user: User, key: keyof User) {
        delete user[key];
        return user;
    }

    private transformData(data: any): any {
        if (Array.isArray(data)) {
            return data.map((item) => this.transformData(item));
        }

        if (data instanceof Object && 'password' in data) {
            this.exclude(data as User, 'password');
            return data;
        }

        return data;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data: this.transformData(data),
            })),
        );
    }
}
