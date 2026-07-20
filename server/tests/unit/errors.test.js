import {
  AppError,
  BadRequestError,
  ConflictError,
  ERROR_CODES,
  NotFoundError,
  ValidationError,
} from '../../src/errors/index.js';
import { formatErrorResponse } from '../../src/utils/errorResponse.js';

describe('error classes', () => {
  it('creates AppError with operational metadata', () => {
    const error = new AppError(418, 'TEAPOT', 'I am a teapot');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.message).toBe('I am a teapot');
    expect(error.isOperational).toBe(true);
  });

  it('creates NotFoundError with defaults', () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.message).toBe('Resource not found');
  });

  it('creates ValidationError with field details', () => {
    const error = new ValidationError('Validation failed', { title: 'Title is required' });

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.details).toEqual({ title: 'Title is required' });
  });

  it('creates BadRequestError for invalid IDs', () => {
    const error = new BadRequestError('Invalid ticket ID format');

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.INVALID_ID);
  });

  it('creates ConflictError for business conflicts', () => {
    const error = new ConflictError('Invalid status transition');

    expect(error.statusCode).toBe(409);
    expect(error.code).toBe(ERROR_CODES.INVALID_TRANSITION);
  });
});

describe('formatErrorResponse', () => {
  it('returns a consistent JSON error envelope', () => {
    expect(
      formatErrorResponse({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Ticket not found',
      }),
    ).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Ticket not found',
      },
    });
  });

  it('includes details when provided', () => {
    expect(
      formatErrorResponse({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: { title: 'Title is required' },
      }),
    ).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { title: 'Title is required' },
      },
    });
  });
});
