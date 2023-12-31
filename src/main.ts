import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './utils/interceptors/response.interceptor';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import metadata from './metadata';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('/api/v1');
    app.use(compression());
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    objectSrc: ["'none'"],
                    baseUri: ["'none'"],
                    frameAncestors: ["'none'"],
                    fontSrc: ["'self'"],
                    imgSrc: ["'self'", 'https://res.cloudinary.com'],
                    connectSrc: ["'self'"],
                    mediaSrc: ["'none'"],
                    frameSrc: ["'none'"],
                },
            },
        }),
    );
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory(errors) {
                const validationErrors = errors.map((error) => error.constraints);
                const validationProperties = errors.map((error) => error.property);
                const fields = validationErrors
                    .map((error, index) => {
                        const message = Object.values(error || {});
                        const errorProperty = validationProperties[index] || 'error';
                        return { [errorProperty]: message[0] };
                    })
                    .reduce((acc, curr) => ({ ...acc, ...curr }));
                return new BadRequestException({
                    success: false,
                    message: 'Validation failed',
                    status: 400,
                    fields: fields,
                });
            },
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    const config = new DocumentBuilder().setTitle('Default Starter API').setVersion('1.0').build();
    await SwaggerModule.loadPluginMetadata(metadata);
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    await app.listen(5000);
}
void bootstrap();
