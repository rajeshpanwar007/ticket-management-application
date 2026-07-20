import { body, param, query } from 'express-validator';
import {
  forbidStatusOnTicketBodyValidator,
  optionalAssignmentValidator,
  optionalDescriptionValidator,
  optionalPriorityValidator,
  optionalStatusFilterValidator,
  optionalTitleValidator,
  requiredCommentBodyValidator,
  requiredDescriptionValidator,
  requiredMongoIdValidator,
  requiredStatusValidator,
  requiredTitleValidator,
} from './shared/fieldValidators.js';

export const listTicketsValidator = [
  query('search')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Search must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters'),
  optionalStatusFilterValidator(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const createTicketValidator = [
  requiredTitleValidator(),
  requiredDescriptionValidator(),
  optionalPriorityValidator(),
  requiredMongoIdValidator('createdBy', 'Created by user'),
  optionalAssignmentValidator(),
  forbidStatusOnTicketBodyValidator('create'),
];

export const updateTicketValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body().custom((_value, { req }) => {
    const { title, description, priority, assignedTo } = req.body;
    const hasUpdate =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      assignedTo !== undefined;

    if (!hasUpdate) {
      throw new Error('At least one field is required to update');
    }

    return true;
  }),
  optionalTitleValidator(),
  optionalDescriptionValidator(),
  optionalPriorityValidator(),
  optionalAssignmentValidator(),
  forbidStatusOnTicketBodyValidator('update'),
];

export const updateTicketStatusValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  requiredStatusValidator(),
];

export const ticketIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
];
