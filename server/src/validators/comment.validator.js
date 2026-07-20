import { param } from 'express-validator';
import {
  requiredCommentBodyValidator,
  requiredMongoIdValidator,
} from './shared/fieldValidators.js';

export const ticketCommentsParamValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
];

export const addCommentValidator = [
  ...ticketCommentsParamValidator,
  requiredCommentBodyValidator(),
  requiredMongoIdValidator('authorId', 'Author'),
];
