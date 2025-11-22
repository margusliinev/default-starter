import { BadRequestException, ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { CatchAllFilter } from './common/filters/catch-all.filter';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'warn', 'error'],
    });

    // Configuration
    const configService = app.get(ConfigService);
    const cookieSecret = configService.get('COOKIE_SECRET');
    const corsOrigin = configService.get('CORS_ORIGIN');
    const nodeEnv = configService.get('NODE_ENV');
    const port = configService.get('PORT');

    // Security
    app.enableCors({ origin: corsOrigin, credentials: true });
    app.use(helmet());

    // Compression
    app.use(compression());

    // Cookies
    app.use(cookieParser(cookieSecret));

    // Global Prefix
    app.setGlobalPrefix('/api');

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
            exceptionFactory(errors) {
                const validationConstraints = errors.map((error) => error.constraints);
                const validationProperties = errors.map((error) => error.property);
                const validationErrors = validationConstraints
                    .map((error, index) => {
                        const message = Object.values(error || {});
                        const errorProperty = validationProperties[index] || 'error';
                        return { [errorProperty]: message[0] };
                    })
                    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
                return new BadRequestException({ errors: validationErrors });
            },
        }),
    );

    // Interceptors
    app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor(30000), new TransformInterceptor(), new ClassSerializerInterceptor(app.get(Reflector)));

    // Filters
    app.useGlobalFilters(new CatchAllFilter());

    // Listen
    await app.listen(port);
    Logger.log(`Application started on port ${port} (${nodeEnv})`, 'Bootstrap');
}
void bootstrap();
