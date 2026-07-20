import { param, query } from 'express-validator';
import { USER_ROLES } from '../constants/ticket.constants.js';

export const listUsersValidator = [
  query('role')
    .optional()
    .isIn(USER_ROLES)
    .withMessage('Invalid role filter value'),
];

export const userIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];
