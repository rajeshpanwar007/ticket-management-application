import { afterEach, describe, expect, it, vi } from 'vitest';
import { withRetry } from './retry.js';

describe('withRetry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retries retryable failures and eventually succeeds', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce('ok');

    vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 0;
    });

    await expect(withRetry(operation, { retries: 1, delayMs: 1 })).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry client errors', async () => {
    const operation = vi.fn().mockRejectedValue({ response: { status: 404 } });

    await expect(withRetry(operation, { retries: 2, delayMs: 1 })).rejects.toEqual({
      response: { status: 404 },
    });
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
