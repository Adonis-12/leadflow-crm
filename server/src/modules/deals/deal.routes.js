import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as controller from './deal.controller.js';
import {
  createDealSchema,
  updateDealSchema,
  listDealsSchema,
} from './deal.validation.js';

const router = Router();

router.use(authenticate);

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues,
    });
  }

  if (source === 'query') {
    res.locals.validatedQuery = result.data;
  } else {
    req[source] = result.data;
  }

  next();
};

router.post('/', validate(createDealSchema), controller.create);
router.get('/', validate(listDealsSchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.patch('/:id', validate(updateDealSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;