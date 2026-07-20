import { useCallback } from 'react';
import { ticketService } from '../services/index.js';
import useAsync from './useAsync.js';

const useTicket = (id) => {
  const fetchTicket = useCallback(() => {
    if (!id) {
      return Promise.resolve(null);
    }
    return ticketService.getTicketById(id);
  }, [id]);

  const { data, loading, error, refetch, setData } = useAsync(fetchTicket, [fetchTicket], {
    immediate: Boolean(id),
    initialData: null,
  });

  return {
    ticket: data,
    loading: id ? loading : false,
    error,
    refetch,
    setTicket: setData,
  };
};

export default useTicket;
