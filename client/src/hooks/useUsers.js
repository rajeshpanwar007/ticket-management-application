import { useCallback } from 'react';
import { userService } from '../services/index.js';
import useAsync from './useAsync.js';

const useUsers = ({ role } = {}) => {
  const fetchUsers = useCallback(() => {
    const params = role ? { role } : {};
    return userService.getUsers(params);
  }, [role]);

  const { data, loading, error, refetch } = useAsync(fetchUsers, [fetchUsers], {
    initialData: { users: [], total: 0 },
  });

  return {
    users: data?.users ?? [],
    total: data?.total ?? 0,
    loading,
    error,
    refetch,
  };
};

export default useUsers;
