
import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as controller from './lead.controller.js';
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
} from './lead.validation.js';

const router = Router();

router.use(authenticate);


const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (source === 'query') {
    res.locals.validatedQuery = result.data;
  } else {
    req[source] = result.data;
  }

  next();
};


router.post('/', validate(createLeadSchema), controller.create);
router.get('/', validate(listLeadsSchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.patch('/:id', validate(updateLeadSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
