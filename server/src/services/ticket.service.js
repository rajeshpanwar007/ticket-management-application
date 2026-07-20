import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js';
import { ConflictError, NotFoundError } from '../errors/index.js';
import { allowedNextStatuses, canTransition, formatStatusLabel } from '../domain/statusMachine.js';
import { buildTicketListFilter, buildTicketListSort } from '../domain/ticketQuery.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { COMMENT_POPULATE, USER_POPULATE } from '../constants/populate.constants.js';

const ACTIVE_FILTER = { deletedAt: null };

const formatTicket = (ticket) => {
  const ticketObject = ticket.toObject({ virtuals: true });
  return {
    ...ticketObject,
    allowedNextStatuses: allowedNextStatuses(ticketObject.status),
  };
};

const ensureUserExists = async (userId, label = 'User') => {
  const exists = await User.exists({ _id: userId });
  if (!exists) {
    throw new NotFoundError(`${label} not found`);
  }
};

const findActiveTicketById = async (id) => {
  const ticket = await Ticket.findOne({ _id: id, ...ACTIVE_FILTER });
  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }
  return ticket;
};

export const getActiveTicketById = findActiveTicketById;

const buildInvalidTransitionMessage = (from, to) => {
  const allowed = allowedNextStatuses(from)
    .map((status) => formatStatusLabel(status))
    .join(', ') || 'none';

  return `Cannot change status from ${formatStatusLabel(from)} to ${formatStatusLabel(to)}. Allowed transitions from ${formatStatusLabel(from)}: ${allowed}.`;
};

const assertValidStatusTransition = (currentStatus, newStatus) => {
  if (!canTransition(currentStatus, newStatus)) {
    throw new ConflictError(buildInvalidTransitionMessage(currentStatus, newStatus));
  }
};

export const getTickets = async (filters = {}) => {
  const { page, limit, skip } = parsePagination(filters);
  const { filter, useTextSearch } = buildTicketListFilter(filters);
  const sort = buildTicketListSort(useTextSearch);

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate(USER_POPULATE)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets: tickets.map((ticket) => ({
      ...ticket,
      allowedNextStatuses: allowedNextStatuses(ticket.status),
    })),
    ...buildPaginationMeta({ total, page, limit }),
  };
};

export const createTicket = async (data) => {
  const { title, description, priority, createdBy, assignedTo } = data;

  await ensureUserExists(createdBy, 'Created by user');

  if (assignedTo) {
    await ensureUserExists(assignedTo, 'Assignee');
  }

  const ticket = await Ticket.create({
    title,
    description,
    priority,
    createdBy,
    assignedTo: assignedTo ?? null,
    status: 'open',
  });

  await ticket.populate(USER_POPULATE);
  return formatTicket(ticket);
};

export const getTicketById = async (id) => {
  const ticket = await Ticket.findOne({ _id: id, ...ACTIVE_FILTER })
    .populate(USER_POPULATE)
    .populate(COMMENT_POPULATE);

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  return formatTicket(ticket);
};

export const updateTicket = async (id, updates) => {
  const ticket = await findActiveTicketById(id);
  const { title, description, priority, assignedTo } = updates;

  if (title !== undefined) {
    ticket.title = title;
  }

  if (description !== undefined) {
    ticket.description = description;
  }

  if (priority !== undefined) {
    ticket.priority = priority;
  }

  if (assignedTo !== undefined) {
    if (assignedTo) {
      await ensureUserExists(assignedTo, 'Assignee');
    }
    ticket.assignedTo = assignedTo;
  }

  await ticket.save();
  await ticket.populate(USER_POPULATE);
  return formatTicket(ticket);
};

export const updateTicketStatus = async (id, newStatus) => {
  const ticket = await findActiveTicketById(id);

  if (ticket.status === newStatus) {
    await ticket.populate(USER_POPULATE);
    return formatTicket(ticket);
  }

  assertValidStatusTransition(ticket.status, newStatus);

  ticket.status = newStatus;
  await ticket.save();
  await ticket.populate(USER_POPULATE);
  return formatTicket(ticket);
};

export const deleteTicket = async (id) => {
  const ticket = await findActiveTicketById(id);
  ticket.deletedAt = new Date();
  await ticket.save();
};
