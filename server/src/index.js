import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`[INFO] Server running on port ${env.port} (${env.nodeEnv})`);
  });
};

startServer().catch((err) => {
  console.error('[ERROR] Failed to start server:', err.message);
  process.exit(1);
});
