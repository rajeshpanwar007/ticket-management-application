import mongoose from 'mongoose';
import { BadRequestError } from '../errors/index.js';

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError(`Invalid ${paramName} format`));
  }

  return next();
};

export default validateObjectId;
