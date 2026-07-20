const DEFAULT_RETRIES = 2;
const DEFAULT_DELAY_MS = 500;

const isRetryableError = (error) => {
  if (!error?.response) {
    return true;
  }

  const status = error.response.status;
  return status >= 500;
};

export const withRetry = async (operation, { retries = DEFAULT_RETRIES, delayMs = DEFAULT_DELAY_MS } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, delayMs * (attempt + 1));
      });
    }
  }

  throw lastError;
};
