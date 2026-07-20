import { useState, useEffect, useCallback } from 'react';
import * as usersApi from '../api/users.js';

// TODO: Implement users hook

const useUsers = ({ role } = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    // TODO: Call usersApi.getUsers({ role })
    setLoading(true);
    setError(null);
    try {
      throw new Error('Not implemented: useUsers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { users, loading, error, refetch };
};

export default useUsers;
