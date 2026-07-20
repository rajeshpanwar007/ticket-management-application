import { ERROR_CODES } from './errorCodes.js';

export class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(404, ERROR_CODES.NOT_FOUND, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = null, code = ERROR_CODES.INVALID_ID) {
    super(400, code, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null, code = ERROR_CODES.INVALID_TRANSITION) {
    super(409, code, message, details);
  }
}
