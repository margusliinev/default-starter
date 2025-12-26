import { ErrorSchema, userSelectSchema, userUpdateSchema, VoidSchema, InternalServerError, cookieSchema, OpenApiTag } from '@/common';
import { updateUser, deleteUser } from '@/queries';
import { macroAuth } from '@/macros';
import { Elysia } from 'elysia';

export const featureUsers = new Elysia({ name: 'feature:users', prefix: '/users' })
    .guard({ as: 'scoped', cookie: cookieSchema })
    .use(macroAuth)
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
            const [updatedUser] = await updateUser(user.id, body);
            if (!updatedUser) throw new InternalServerError();

            return updatedUser;
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
            await deleteUser(user.id);

            cookie.session.value = undefined;
            cookie.session.expires = new Date(0);

            set.status = 204;
            return;
        },
        {
            auth: true,
            response: {
                204: VoidSchema,
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
