import { TICKET_STATUSES } from '../constants/ticket.constants.js';

// TODO: Implement transition map — see domain/statusMachine.js
const TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: [],
  cancelled: [],
};

export const canTransition = (from, to) => {
  // TODO: Implement
  if (!TICKET_STATUSES.includes(from) || !TICKET_STATUSES.includes(to)) {
    return false;
  }
  return TRANSITIONS[from]?.includes(to) ?? false;
};

export const allowedNextStatuses = (from) => {
  // TODO: Implement
  return TRANSITIONS[from] ?? [];
};

export const isTerminal = (status) => {
  // TODO: Implement
  return status === 'closed' || status === 'cancelled';
};
