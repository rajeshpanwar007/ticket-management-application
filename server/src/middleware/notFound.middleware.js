import { NotFoundError } from '../errors/index.js';

// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFoundHandler;
