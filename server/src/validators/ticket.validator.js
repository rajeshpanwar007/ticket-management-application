import { body, param, query } from 'express-validator';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../constants/ticket.constants.js';

export const listTicketsValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters'),
  query('status')
    .optional()
    .isIn(TICKET_STATUSES)
    .withMessage('Invalid status filter value'),
];

export const createTicketValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(TICKET_PRIORITIES)
    .withMessage('Invalid priority value'),
  body('createdBy')
    .notEmpty()
    .withMessage('Created by is required')
    .isMongoId()
    .withMessage('Invalid createdBy ID'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignedTo ID'),
];

export const updateTicketValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('priority')
    .optional()
    .isIn(TICKET_PRIORITIES)
    .withMessage('Invalid priority value'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((value) => value === null || /^[a-f\d]{24}$/i.test(value))
    .withMessage('Invalid assignedTo ID'),
  body('status').custom((value) => {
    if (value !== undefined) {
      throw new Error('Use PATCH /api/tickets/:id/status to update status');
    }
    return true;
  }),
];

export const updateTicketStatusValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(TICKET_STATUSES)
    .withMessage('Invalid status value'),
];

export const ticketIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid ticket ID'),
];
