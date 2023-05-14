import express from 'express';
import { getAllUsers, createUser } from '../controllers/index.js';
const router = express.Router();

router.route('/api/v1/users').get(getAllUsers).post(createUser);

export default router;
