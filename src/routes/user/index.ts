/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { deleteUser, getUser, updateUserPassword, updateUserProfile } from '../../controllers/user';
import { auth } from '../../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(auth, getUser).patch(auth, updateUserProfile).put(auth, updateUserPassword).delete(auth, deleteUser);

export default router;
