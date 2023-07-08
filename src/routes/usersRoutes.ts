/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { createSingleUser, deleteSingleUser, getAllUsers, getSingleUser, updateSingleUser } from '../controllers/users';
import { auth } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/users').get(auth, getAllUsers).post(auth, createSingleUser).delete(auth, deleteSingleUser);
router.route('/users/:id').get(auth, getSingleUser).put(auth, updateSingleUser);

export default router;
