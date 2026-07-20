import { useState, useEffect, useCallback } from 'react';
import * as ticketsApi from '../api/tickets.js';

// TODO: Implement single ticket hook

const useTicket = (id) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    // TODO: Call ticketsApi.getTicketById(id)
    setLoading(true);
    setError(null);
    try {
      throw new Error('Not implemented: useTicket');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ticket, loading, error, refetch };
};

export default useTicket;
