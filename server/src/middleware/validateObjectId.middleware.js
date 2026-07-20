import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(400, 'INVALID_ID', `Invalid ${paramName} format`));
  }

  return next();
};

export default validateObjectId;
