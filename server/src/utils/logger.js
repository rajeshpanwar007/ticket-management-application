import env from '../config/env.js';

const shouldLogDebug = () => env.nodeEnv === 'development';

const formatMeta = (meta) => (meta ? ` ${JSON.stringify(meta)}` : '');

const write = (level, message, meta) => {
  const output = `[${level}] ${message}${formatMeta(meta)}`;

  if (level === 'ERROR') {
    console.error(output);
    return;
  }

  if (level === 'WARN') {
    console.warn(output);
    return;
  }

  console.log(output);
};

const logger = {
  info(message, meta) {
    write('INFO', message, meta);
  },

  warn(message, meta) {
    write('WARN', message, meta);
  },

  error(message, meta) {
    write('ERROR', message, meta);
  },

  debug(message, meta) {
    if (shouldLogDebug()) {
      write('DEBUG', message, meta);
    }
  },
};

export default logger;
