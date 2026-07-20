import { describe, expect, it } from 'vitest';
import { getErrorMessage, getFieldErrors } from './apiError.js';

describe('apiError utils', () => {
  it('extracts API error messages from axios responses', () => {
    const error = {
      response: {
        data: {
          error: {
            message: 'Ticket not found',
          },
        },
      },
    };

    expect(getErrorMessage(error)).toBe('Ticket not found');
  });

  it('extracts field-level validation details', () => {
    const error = {
      response: {
        data: {
          error: {
            details: {
              title: 'Title is required',
            },
          },
        },
      },
    };

    expect(getFieldErrors(error)).toEqual({ title: 'Title is required' });
  });

  it('falls back to error.message when API envelope is missing', () => {
    expect(getErrorMessage(new Error('Network Error'))).toBe('Network Error');
  });
});
