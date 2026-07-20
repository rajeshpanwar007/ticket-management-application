import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.middleware.js';
import validateObjectId from '../middleware/validateObjectId.middleware.js';
import * as commentController from '../controllers/comment.controller.js';
import { addCommentValidator } from '../validators/comment.validator.js';

const router = Router({ mergeParams: true });

router.post(
  '/',
  validate(addCommentValidator),
  validateObjectId('id'),
  asyncHandler(commentController.addComment),
);

export default router;
