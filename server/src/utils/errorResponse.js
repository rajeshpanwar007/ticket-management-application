export const formatErrorResponse = ({ code, message, details = null }) => {
  const body = {
    error: {
      code,
      message,
    },
  };

  if (details && Object.keys(details).length > 0) {
    body.error.details = details;
  }

  return body;
};
