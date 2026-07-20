import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/apiError.js';

const useAsync = (asyncFn, deps = [], { immediate = true, initialData = null } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await asyncFn(...args);

      if (mountedRef.current) {
        setData(result);
      }

      return { data: result, error: null };
    } catch (err) {
      const message = getErrorMessage(err);

      if (mountedRef.current) {
        setError(message);
      }

      return { data: null, error: message, originalError: err };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
    reset,
    setData,
  };
};

export default useAsync;
