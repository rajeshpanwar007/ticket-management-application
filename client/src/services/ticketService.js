import * as ticketsApi from '../api/tickets.js';
import { withRetry } from './retry.js';

export const ticketService = {
  getTickets: (params) => withRetry(() => ticketsApi.getTickets(params)),
  getTicketById: (id) => withRetry(() => ticketsApi.getTicketById(id)),
  createTicket: (payload) => ticketsApi.createTicket(payload),
  updateTicket: (id, payload) => ticketsApi.updateTicket(id, payload),
  updateTicketStatus: (id, status) => ticketsApi.updateTicketStatus(id, status),
};

export default ticketService;
