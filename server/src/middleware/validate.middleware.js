import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const details = errors.mapped();
    const fieldErrors = Object.fromEntries(
      Object.entries(details).map(([field, err]) => [field, err.msg]),
    );

    return next(
      new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', fieldErrors),
    );
  };
};

export default validate;
