import { body, query } from 'express-validator';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../../constants/ticket.constants.js';
import {
  COMMENT_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '../../constants/validation.constants.js';

const MONGO_ID_PATTERN = /^[a-f\d]{24}$/i;

const isMongoIdOrNull = (value) => value === null || MONGO_ID_PATTERN.test(value);

const enumMessage = (field, values) => `${field} must be one of: ${values.join(', ')}`;

export const optionalTitleValidator = () =>
  body('title')
    .optional()
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage(`Title cannot exceed ${TITLE_MAX_LENGTH} characters`);

export const requiredTitleValidator = () =>
  body('title')
    .exists({ checkFalsy: true })
    .withMessage('Title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage(`Title cannot exceed ${TITLE_MAX_LENGTH} characters`);

export const optionalDescriptionValidator = () =>
  body('description')
    .optional()
    .bail()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);

export const requiredDescriptionValidator = () =>
  body('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required')
    .bail()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);

export const optionalPriorityValidator = () =>
  body('priority')
    .optional({ values: 'falsy' })
    .bail()
    .isString()
    .withMessage('Priority must be a string')
    .trim()
    .isIn(TICKET_PRIORITIES)
    .withMessage(enumMessage('Priority', TICKET_PRIORITIES));

export const requiredStatusValidator = () =>
  body('status')
    .exists({ checkFalsy: true })
    .withMessage('Status is required')
    .bail()
    .isString()
    .withMessage('Status must be a string')
    .trim()
    .isIn(TICKET_STATUSES)
    .withMessage(enumMessage('Status', TICKET_STATUSES));

export const optionalStatusFilterValidator = () =>
  query('status')
    .optional({ values: 'falsy' })
    .bail()
    .isString()
    .withMessage('Status must be a string')
    .trim()
    .isIn(TICKET_STATUSES)
    .withMessage(enumMessage('Status', TICKET_STATUSES));

export const forbidStatusOnTicketBodyValidator = (context) =>
  body('status').custom((value) => {
    if (value !== undefined) {
      throw new Error(
        context === 'create'
          ? 'Status cannot be set on create; tickets always start as open'
          : 'Use PATCH /api/tickets/:id/status to update status',
      );
    }
    return true;
  });

export const optionalAssignmentValidator = () =>
  body('assignedTo')
    .optional({ nullable: true, values: 'null' })
    .custom((value) => {
      if (!isMongoIdOrNull(value)) {
        throw new Error('Assignment must be a valid user ID or null');
      }
      return true;
    });

export const requiredCommentBodyValidator = () =>
  body('body')
    .exists({ checkFalsy: true })
    .withMessage('Comment body is required')
    .bail()
    .isString()
    .withMessage('Comment body must be a string')
    .trim()
    .notEmpty()
    .withMessage('Comment body cannot be empty')
    .isLength({ max: COMMENT_MAX_LENGTH })
    .withMessage(`Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`);

export const requiredMongoIdValidator = (field, label = field) =>
  body(field)
    .exists({ checkFalsy: true })
    .withMessage(`${label} is required`)
    .bail()
    .isString()
    .withMessage(`${label} must be a string`)
    .trim()
    .isMongoId()
    .withMessage(`Invalid ${label}`);
