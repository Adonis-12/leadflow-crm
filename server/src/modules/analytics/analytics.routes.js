import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { dashboard } from './analytics.controller.js';

const router = Router();

router.use(authenticate);
router.get('/dashboard', dashboard);

export default router;