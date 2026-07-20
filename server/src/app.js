import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import routes from './routes/index.js';
import requestLogger from './middleware/requestLogger.middleware.js';
import notFoundHandler from './middleware/notFound.middleware.js';
import errorHandler from './middleware/errorHandler.middleware.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
