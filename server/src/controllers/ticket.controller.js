import * as ticketService from '../services/ticket.service.js';

export const listTickets = async (req, res) => {
  const result = await ticketService.getTickets(req.query);
  res.status(200).json(result);
};

export const createTicket = async (req, res) => {
  const ticket = await ticketService.createTicket(req.body);
  res.status(201).json({ ticket });
};

export const getTicket = async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id);
  res.status(200).json({ ticket });
};

export const updateTicket = async (req, res) => {
  const ticket = await ticketService.updateTicket(req.params.id, req.body);
  res.status(200).json({ ticket });
};

export const updateTicketStatus = async (req, res) => {
  const ticket = await ticketService.updateTicketStatus(req.params.id, req.body.status);
  res.status(200).json({ ticket });
};

export const deleteTicket = async (req, res) => {
  await ticketService.deleteTicket(req.params.id);
  res.status(204).send();
};
