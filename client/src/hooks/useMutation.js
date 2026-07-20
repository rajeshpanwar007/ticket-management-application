import { useCallback, useState } from 'react';
import { useToastContext } from '../context/ToastContext.jsx';
import { getErrorMessage, getFieldErrors } from '../utils/apiError.js';

const useMutation = (
  mutationFn,
  {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = Boolean(successMessage),
    showErrorToast = false,
  } = {},
) => {
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        const result = await mutationFn(...args);

        if (showSuccessToast && successMessage) {
          showToast(successMessage, 'success');
        }

        onSuccess?.(result, ...args);
        return { data: result, error: null, fieldErrors: {} };
      } catch (err) {
        const message = getErrorMessage(err, errorMessage);
        const fields = getFieldErrors(err);

        setError(message);
        setFieldErrors(fields);

        if (showErrorToast) {
          showToast(message, 'error');
        }

        onError?.(err, ...args);
        return { data: null, error: message, fieldErrors: fields, originalError: err };
      } finally {
        setLoading(false);
      }
    },
    [
      mutationFn,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccessToast,
      showErrorToast,
      showToast,
    ],
  );

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    fieldErrors,
    reset,
    isSubmitting: loading,
  };
};

export default useMutation;
