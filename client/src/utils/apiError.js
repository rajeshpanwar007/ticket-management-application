export const getErrorMessage = (error, fallback = 'An unexpected error occurred') => {
  const apiError = error?.response?.data?.error;

  if (apiError?.message) {
    return apiError.message;
  }

  return error?.message || fallback;
};

export const getFieldErrors = (error) => {
  const details = error?.response?.data?.error?.details;

  if (!details || typeof details !== 'object') {
    return {};
  }

  return details;
};
