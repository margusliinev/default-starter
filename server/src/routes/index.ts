import express from 'express';
import { testRoute } from '../controllers';

const router = express.Router();

router.route('/api/v1/test').get(testRoute);

export default router;
