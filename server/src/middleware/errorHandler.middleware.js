import mongoose from 'mongoose';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ERROR_CODES,
  NotFoundError,
  ValidationError,
} from '../errors/index.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { formatErrorResponse } from '../utils/errorResponse.js';
import {
  VALIDATION_ERROR_CODE,
  VALIDATION_ERROR_MESSAGE,
} from '../constants/validation.constants.js';

const sendError = (res, error) =>
  res.status(error.statusCode).json(
    formatErrorResponse({
      code: error.code,
      message: error.message,
      details: error.details,
    }),
  );

const handleAppError = (err) => err;

const handleMongooseValidationError = (err) => {
  const details = Object.fromEntries(
    Object.entries(err.errors).map(([field, fieldError]) => [field, fieldError.message]),
  );

  return new ValidationError(VALIDATION_ERROR_MESSAGE, details);
};

const handleMongooseCastError = (err) =>
  new BadRequestError('Invalid ID format', { path: err.path, value: err.value });

const handleMongoDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';

  return new ConflictError('Duplicate value', { [field]: 'Already exists' }, ERROR_CODES.CONFLICT);
};

const handleDocumentNotFoundError = (err) =>
  new NotFoundError(err.message || 'Resource not found');

const handleJsonSyntaxError = (err) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return new ValidationError('Invalid JSON payload');
  }

  return null;
};

const handleUnknownError = (err, req) => {
  logger.error('Unexpected error', {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  return new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred');
};

const logOperationalError = (err, req) => {
  const meta = {
    method: req.method,
    path: req.originalUrl,
    code: err.code,
    statusCode: err.statusCode,
  };

  if (err.statusCode >= 500) {
    logger.error(err.message, { ...meta, stack: err.stack });
    return;
  }

  if (err.statusCode >= 400) {
    logger.warn(err.message, meta);
  }
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let normalizedError =
    handleJsonSyntaxError(err) ??
    (err instanceof AppError ? handleAppError(err) : null);

  if (!normalizedError && err instanceof mongoose.Error.ValidationError) {
    normalizedError = handleMongooseValidationError(err);
  }

  if (!normalizedError && err instanceof mongoose.Error.CastError) {
    normalizedError = handleMongooseCastError(err);
  }

  if (!normalizedError && err.name === 'DocumentNotFoundError') {
    normalizedError = handleDocumentNotFoundError(err);
  }

  if (!normalizedError && err.code === 11000) {
    normalizedError = handleMongoDuplicateKeyError(err);
  }

  if (!normalizedError) {
    normalizedError = handleUnknownError(err, req);
  } else if (env.nodeEnv !== 'test') {
    logOperationalError(normalizedError, req);
  }

  return sendError(res, normalizedError);
};

export default errorHandler;
