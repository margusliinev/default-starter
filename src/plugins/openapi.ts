import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';

export enum OpenApiTag {
    AUTH = 'Auth',
    USERS = 'Users',
}

export const openapiPlugin = new Elysia().use(
    openapi({
        path: '/docs',
        documentation: {
            info: {
                title: 'Default Starter API',
                description: 'API documentation for the Default Starter API.',
                version: '1.0.0',
            },
            tags: [
                { name: OpenApiTag.AUTH, description: 'Auth endpoints' },
                { name: OpenApiTag.USERS, description: 'Users endpoints' },
            ],
        },
    }),
);
