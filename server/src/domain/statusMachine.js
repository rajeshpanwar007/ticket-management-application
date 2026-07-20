import { TICKET_STATUSES } from '../constants/ticket.constants.js';

/**
 * Authoritative transition map for the ticket lifecycle.
 * Keep this as pure data + predicates so it can be unit tested independently.
 */
export const TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['closed'],
  closed: [],
  cancelled: [],
};

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export const canTransition = (from, to) => {
  if (!TICKET_STATUSES.includes(from) || !TICKET_STATUSES.includes(to)) {
    return false;
  }

  return TRANSITIONS[from]?.includes(to) ?? false;
};

export const allowedNextStatuses = (from) => TRANSITIONS[from] ?? [];

export const isTerminal = (status) => status === 'closed' || status === 'cancelled';

export const formatStatusLabel = (status) => STATUS_LABELS[status] ?? status;
