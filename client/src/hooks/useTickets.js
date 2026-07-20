import { useCallback } from 'react';
import { ticketService } from '../services/index.js';
import useAsync from './useAsync.js';

const useTickets = ({ search, status, page, limit } = {}) => {
  const fetchTickets = useCallback(() => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    return ticketService.getTickets(params);
  }, [search, status, page, limit]);

  const { data, loading, error, refetch } = useAsync(fetchTickets, [fetchTickets], {
    initialData: { tickets: [], total: 0 },
  });

  return {
    tickets: data?.tickets ?? [],
    total: data?.total ?? 0,
    loading,
    error,
    refetch,
  };
};

export default useTickets;
