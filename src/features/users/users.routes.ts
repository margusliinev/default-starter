import { ErrorSchema, NoContentSchema, userSelectSchema, userUpdateSchema } from '@/common/schemas';
import { updateCurrentUser, deleteCurrentUser } from './users.service';
import { OpenApiTag } from '@/common/enums';
import { authMacro } from '@/macros/auth';
import { cookie } from '@/common/cookie';
import { Elysia } from 'elysia';

export const usersRoutes = new Elysia({ name: 'route:users', prefix: '/users' })
    .guard({ as: 'scoped', cookie })
    .use(authMacro)
    .get('/me', ({ user }) => user, {
        auth: true,
        response: {
            200: userSelectSchema,
            401: ErrorSchema,
            500: ErrorSchema,
        },
        detail: {
            tags: [OpenApiTag.USERS],
            summary: 'Get me',
            description: 'Gets the current user.',
        },
    })
    .patch(
        '/me',
        async ({ user, body }) => {
            return await updateCurrentUser(user.id, body);
        },
        {
            auth: true,
            body: userUpdateSchema,
            response: {
                200: userSelectSchema,
                401: ErrorSchema,
                422: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.USERS],
                summary: 'Update me',
                description: 'Updates the current user.',
            },
        },
    )
    .delete(
        '/me',
        async ({ user, cookie, set }) => {
            await deleteCurrentUser(user.id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            set.status = 204;
            return;
        },
        {
            auth: true,
            response: {
                204: NoContentSchema,
                401: ErrorSchema,
                500: ErrorSchema,
            },
            detail: {
                tags: [OpenApiTag.USERS],
                summary: 'Delete me',
                description: 'Deletes the current user.',
            },
        },
    );
