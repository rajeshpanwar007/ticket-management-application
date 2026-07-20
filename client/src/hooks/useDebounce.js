import { useState, useEffect } from 'react';

// TODO: Implement debounce hook

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // TODO: Set timeout to update debouncedValue
    setDebouncedValue(value);
    return () => {};
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
