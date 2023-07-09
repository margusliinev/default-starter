/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import { createSingleUser, deleteSingleUser, getAllUsers, getSingleUser, updateSingleUser } from '../controllers/users';
import { auth } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(auth, getAllUsers).post(auth, createSingleUser).patch(auth, updateSingleUser).delete(auth, deleteSingleUser);
router.route('/:id').get(auth, getSingleUser);

export default router;
