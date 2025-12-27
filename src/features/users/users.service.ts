import type { User, UpdateUser } from '@/common/types';
import { updateUser, deleteUser } from '@/queries/users';
import { InternalServerError } from '@/common/errors';

export async function updateCurrentUser(id: User['id'], data: UpdateUser) {
    const [updatedUser] = await updateUser(id, data);
    if (!updatedUser) throw new InternalServerError();

    return updatedUser;
}

export async function deleteCurrentUser(userId: User['id']) {
    await deleteUser(userId);
}
