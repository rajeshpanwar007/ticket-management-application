import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    };

    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', meta);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', meta);
      return;
    }

    logger.info('Request completed', meta);
  });

  next();
};

export default requestLogger;
