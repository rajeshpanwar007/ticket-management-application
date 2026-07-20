import { body, param } from 'express-validator';

export const addCommentValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Comment body is required')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
  body('authorId')
    .notEmpty()
    .withMessage('Author ID is required')
    .isMongoId()
    .withMessage('Invalid authorId'),
];
