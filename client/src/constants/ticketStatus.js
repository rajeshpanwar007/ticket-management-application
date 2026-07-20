export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

export const TICKET_PRIORITIES = ['low', 'medium', 'high'];

export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

// TODO: Mirror server transition map — see server/src/domain/statusMachine.js
export const TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['closed'],
  closed: [],
  cancelled: [],
};

export const allowedNextStatuses = (currentStatus) => TRANSITIONS[currentStatus] ?? [];

export const STATUS_ACTION_LABELS = {
  in_progress: 'Start Progress',
  cancelled: 'Cancel Ticket',
  resolved: 'Mark Resolved',
  closed: 'Close Ticket',
};
