import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/index.js';
import {
  VALIDATION_ERROR_MESSAGE,
} from '../constants/validation.constants.js';

const normalizeFieldName = (field) => {
  if (!field || field === '') {
    return 'body';
  }

  return field;
};

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const details = errors.mapped();
    const fieldErrors = Object.fromEntries(
      Object.entries(details).map(([field, err]) => [normalizeFieldName(field), err.msg]),
    );

    return next(new ValidationError(VALIDATION_ERROR_MESSAGE, fieldErrors));
  };
};

export default validate;
