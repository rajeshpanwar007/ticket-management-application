import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.middleware.js';
import validateObjectId from '../middleware/validateObjectId.middleware.js';
import * as commentController from '../controllers/comment.controller.js';
import {
  addCommentValidator,
  ticketCommentsParamValidator,
} from '../validators/comment.validator.js';

const router = Router({ mergeParams: true });

router.get(
  '/',
  validate(ticketCommentsParamValidator),
  validateObjectId('id'),
  asyncHandler(commentController.getComments),
);

router.post(
  '/',
  validate(addCommentValidator),
  validateObjectId('id'),
  asyncHandler(commentController.addComment),
);

export default router;
