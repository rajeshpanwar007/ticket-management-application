import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from '../../src/scripts/seed/seedDatabase.js';

let mongoServer;
let app;
let seedResult;

export const connectIntegrationEnvironment = async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';

  const [{ default: connectDB }, { default: appModule }] = await Promise.all([
    import('../../src/config/db.js'),
    import('../../src/app.js'),
  ]);

  app = appModule;
  await connectDB();

  const { Ticket } = await import('../../src/models/index.js');
  await Ticket.syncIndexes();
};

export const disconnectIntegrationEnvironment = async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const seedIntegrationDatabase = async () => {
  seedResult = await seedDatabase({ clearExisting: true });
  return seedResult;
};

export const getIntegrationApp = () => {
  if (!app) {
    throw new Error('Integration app not initialized. Call connectIntegrationEnvironment() first.');
  }

  return app;
};

export const getSeedResult = () => {
  if (!seedResult) {
    throw new Error('Seed data not available. Call seedIntegrationDatabase() first.');
  }

  return seedResult;
};
