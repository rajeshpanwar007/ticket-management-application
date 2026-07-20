import ApiError from '../utils/ApiError.js';

// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFoundHandler;
