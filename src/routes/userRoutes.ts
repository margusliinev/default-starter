/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { deleteUser, getUser, updateUser } from '../controllers/user';
import { auth } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(auth, getUser).patch(auth, updateUser).delete(auth, deleteUser);

export default router;
