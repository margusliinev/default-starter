import { ErrorResponse, VoidResponse } from '@/schemas/common';
import { updateUser, deleteUser } from '@/queries/users';
import { InternalServerError } from '@/lib/errors';
import { userSelectSchema } from '@/db/schema';
import { UpdateUserBody } from '@/schemas/users';
import { OpenApiTag } from '@/plugins/openapi';
import { authMacro } from '@/macros/auth';
import { Elysia } from 'elysia';

export const usersRoutes = new Elysia({ prefix: '/users' })
    .use(authMacro)
    .get(
        '/me',
        ({ user }) => {
            return user;
        },
        {
            auth: true,
            response: {
                200: userSelectSchema,
                401: ErrorResponse,
                500: ErrorResponse,
            },
            detail: {
                tags: [OpenApiTag.USERS],
                summary: 'Get me',
                description: 'Gets the current user.',
            },
        },
    )
    .patch(
        '/me',
        async ({ user, body }) => {
            const [updatedUser] = await updateUser(user.id, body);
            if (!updatedUser) throw new InternalServerError();

            return updatedUser;
        },
        {
            auth: true,
            body: UpdateUserBody,
            response: {
                200: userSelectSchema,
                401: ErrorResponse,
                422: ErrorResponse,
                500: ErrorResponse,
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
                204: VoidResponse,
                401: ErrorResponse,
                500: ErrorResponse,
            },
            detail: {
                tags: [OpenApiTag.USERS],
                summary: 'Delete me',
                description: 'Deletes the current user.',
            },
        },
    );
