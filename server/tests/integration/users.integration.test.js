import mongoose from 'mongoose';
import request from 'supertest';
import { ERROR_CODES } from '../../src/errors/index.js';
import {
  connectIntegrationEnvironment,
  disconnectIntegrationEnvironment,
  getIntegrationApp,
  getSeedResult,
  seedIntegrationDatabase,
} from '../helpers/testEnvironment.js';

let app;
let seed;

beforeAll(async () => {
  await connectIntegrationEnvironment();
  app = getIntegrationApp();
}, 60000);

beforeEach(async () => {
  seed = await seedIntegrationDatabase();
}, 30000);

afterAll(async () => {
  await disconnectIntegrationEnvironment();
}, 30000);

describe('Users API Integration', () => {
  it('lists all seeded users', async () => {
    const response = await request(app).get('/api/users').expect(200);

    expect(response.body.total).toBe(4);
    expect(response.body.users.map((user) => user.email)).toEqual(
      expect.arrayContaining([
        'admin@demo.com',
        'manager@demo.com',
        'agent@demo.com',
        'customer@demo.com',
      ]),
    );
  });

  it('filters users by role', async () => {
    const response = await request(app).get('/api/users?role=agent').expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.users[0].name).toBe('Bob Agent');
  });

  it('returns a single user by id', async () => {
    const customer = seed.usersByKey.customer;

    const response = await request(app).get(`/api/users/${customer._id}`).expect(200);

    expect(response.body.user).toMatchObject({
      name: 'Alice Customer',
      email: 'customer@demo.com',
      role: 'customer',
    });
  });

  it('returns 404 for a missing user', async () => {
    const missingId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/users/${missingId}`).expect(404);

    expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('returns 400 for invalid role filter', async () => {
    const response = await request(app).get('/api/users?role=invalid').expect(400);

    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
