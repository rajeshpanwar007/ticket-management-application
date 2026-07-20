import { useCallback } from 'react';
import { ticketService } from '../services/index.js';
import useMutation from './useMutation.js';

export const useCreateTicket = (options = {}) => {
  const mutateFn = useCallback((payload) => ticketService.createTicket(payload), []);

  return useMutation(mutateFn, {
    successMessage: 'Ticket created successfully',
    ...options,
  });
};

export const useUpdateTicket = (options = {}) => {
  const mutateFn = useCallback(
    ({ id, payload }) => ticketService.updateTicket(id, payload),
    [],
  );

  return useMutation(mutateFn, {
    successMessage: 'Ticket updated successfully',
    ...options,
  });
};

export const useUpdateTicketStatus = (options = {}) => {
  const mutateFn = useCallback(
    ({ id, status }) => ticketService.updateTicketStatus(id, status),
    [],
  );

  return useMutation(mutateFn, {
    successMessage: 'Ticket status updated',
    showErrorToast: false,
    ...options,
  });
};
