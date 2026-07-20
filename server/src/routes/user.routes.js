import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.middleware.js';
import validateObjectId from '../middleware/validateObjectId.middleware.js';
import * as userController from '../controllers/user.controller.js';
import {
  listUsersValidator,
  userIdParamValidator,
} from '../validators/user.validator.js';

const router = Router();

router.get(
  '/',
  validate(listUsersValidator),
  asyncHandler(userController.listUsers),
);

router.get(
  '/:id',
  validate(userIdParamValidator),
  validateObjectId('id'),
  asyncHandler(userController.getUser),
);

export default router;
