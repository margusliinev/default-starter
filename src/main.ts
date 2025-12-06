import { BadRequestException, ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CatchAllFilter } from './common/filters/catch-all.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import metadata from './metadata';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'warn', 'error'],
    });

    // Configuration
    const configService = app.get(ConfigService);
    const port = configService.get('PORT');
    const nodeEnv = configService.get('NODE_ENV');
    const frontendUrl = configService.get('FRONTEND_URL');
    const cookieSecret = configService.get('COOKIE_SECRET');

    // Security
    app.enableCors({ origin: frontendUrl, credentials: true });
    app.use(helmet());

    // Compression
    app.use(compression());

    // Cookies
    app.use(cookieParser(cookieSecret));

    // Global Prefix
    app.setGlobalPrefix('/api');

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Default Starter API')
        .setDescription('REST API')
        .setVersion('1.0')
        .addTag('Auth')
        .addTag('Users')
        .addTag('Health')
        .build();

    await SwaggerModule.loadPluginMetadata(metadata);
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { defaultModelsExpandDepth: -1 },
    });

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
    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        new TimeoutInterceptor(30000),
        new TransformInterceptor(),
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    // Filters
    app.useGlobalFilters(new CatchAllFilter());

    // Listen
    await app.listen(port);
    Logger.log(`Application started on port ${port} (${nodeEnv})`, 'Bootstrap');
}
void bootstrap();
