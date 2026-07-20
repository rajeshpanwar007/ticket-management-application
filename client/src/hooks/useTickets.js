import { useState, useEffect, useCallback } from 'react';
import * as ticketsApi from '../api/tickets.js';

// TODO: Implement tickets list hook

const useTickets = ({ search, status } = {}) => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    // TODO: Call ticketsApi.getTickets({ search, status })
    setLoading(true);
    setError(null);
    try {
      throw new Error('Not implemented: useTickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tickets, total, loading, error, refetch };
};

export default useTickets;
