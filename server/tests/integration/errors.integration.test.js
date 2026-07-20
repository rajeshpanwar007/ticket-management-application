import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { User } from '../../src/models/index.js';
import { ERROR_CODES } from '../../src/errors/index.js';

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';

  const [{ default: connectDB }, { default: appModule }] = await Promise.all([
    import('../../src/config/db.js'),
    import('../../src/app.js'),
  ]);

  app = appModule;
  await connectDB();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

describe('Centralized error handling', () => {
  it('returns 404 for unknown routes with a consistent error shape', async () => {
    const response = await request(app).get('/api/unknown-route').expect(404);

    expect(response.body).toEqual({
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'Route not found: GET /api/unknown-route',
      },
    });
  });

  it('returns 400 for invalid JSON payloads', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{ invalid json')
      .expect(400);

    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(response.body.error.message).toBe('Invalid JSON payload');
  });

  it('returns 400 for invalid ObjectId route params', async () => {
    const response = await request(app).get('/api/tickets/not-an-object-id').expect(400);

    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(response.body.error.details.id).toBe('Invalid ticket ID');
  });

  it('returns 404 for missing resources via service layer', async () => {
    const missingId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/tickets/${missingId}`).expect(404);

    expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(response.body.error.message).toBe('Ticket not found');
  });

  it('returns 409 for invalid status transitions', async () => {
    const user = await User.create({
      name: 'Error Test User',
      email: `error-${Date.now()}@demo.com`,
    });

    const created = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Transition test',
        description: 'Testing conflict errors',
        createdBy: user._id.toString(),
      })
      .expect(201);

    const response = await request(app)
      .patch(`/api/tickets/${created.body.ticket._id}/status`)
      .send({ status: 'closed' })
      .expect(409);

    expect(response.body.error.code).toBe(ERROR_CODES.INVALID_TRANSITION);
    expect(response.body.error.message).toMatch(/Cannot change status from Open to Closed/);
  });
});
