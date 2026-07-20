import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.middleware.js';
import validateObjectId from '../middleware/validateObjectId.middleware.js';
import * as ticketController from '../controllers/ticket.controller.js';
import {
  listTicketsValidator,
  createTicketValidator,
  updateTicketValidator,
  updateTicketStatusValidator,
  ticketIdParamValidator,
} from '../validators/ticket.validator.js';

const router = Router();

router.get(
  '/',
  validate(listTicketsValidator),
  asyncHandler(ticketController.listTickets),
);

router.post(
  '/',
  validate(createTicketValidator),
  asyncHandler(ticketController.createTicket),
);

router.get(
  '/:id',
  validate(ticketIdParamValidator),
  validateObjectId('id'),
  asyncHandler(ticketController.getTicket),
);

router.patch(
  '/:id/status',
  validate(updateTicketStatusValidator),
  validateObjectId('id'),
  asyncHandler(ticketController.updateTicketStatus),
);

router.patch(
  '/:id',
  validate(updateTicketValidator),
  validateObjectId('id'),
  asyncHandler(ticketController.updateTicket),
);

router.delete(
  '/:id',
  validate(ticketIdParamValidator),
  validateObjectId('id'),
  asyncHandler(ticketController.deleteTicket),
);

export default router;
