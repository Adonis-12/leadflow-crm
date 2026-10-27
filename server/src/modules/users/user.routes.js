import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

import {
  getUsers,
  changeUserRole,
} from './user.controller.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', getUsers);
router.patch('/:id/role', changeUserRole);

export default router;