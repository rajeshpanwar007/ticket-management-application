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

describe('Backend Error Handling Integration', () => {
  it('returns a consistent 404 envelope for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist').expect(404);

    expect(response.body.error).toEqual({
      code: ERROR_CODES.NOT_FOUND,
      message: 'Route not found: GET /api/does-not-exist',
    });
  });

  it('returns 400 for malformed JSON bodies', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{ broken json')
      .expect(400);

    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(response.body.error.message).toBe('Invalid JSON payload');
  });

  it('returns 400 for invalid route ObjectId params', async () => {
    const response = await request(app).get('/api/tickets/not-valid-id').expect(400);

    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(response.body.error.details.id).toBe('Invalid ticket ID');
  });

  it('returns 404 when updating a missing ticket', async () => {
    const missingId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/tickets/${missingId}`)
      .send({ title: 'Missing ticket update' })
      .expect(404);

    expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('returns 400 when update payload has no mutable fields', async () => {
    const ticket = seed.ticketsByKey.t1;

    const response = await request(app)
      .patch(`/api/tickets/${ticket._id}`)
      .send({})
      .expect(400);

    expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(response.body.error.details.body).toMatch(/At least one field is required/);
  });

  it('returns 404 when creating a ticket with a missing assignee', async () => {
    const customer = seed.usersByKey.customer;
    const missingAssigneeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Bad assignee ticket',
        description: 'Assignee does not exist.',
        createdBy: customer._id.toString(),
        assignedTo: missingAssigneeId.toString(),
      })
      .expect(404);

    expect(response.body.error.message).toBe('Assignee not found');
  });

  it('returns 404 when reading a soft-deleted ticket', async () => {
    const ticket = seed.ticketsByKey.t7;

    await request(app).delete(`/api/tickets/${ticket._id}`).expect(204);

    const response = await request(app).get(`/api/tickets/${ticket._id}`).expect(404);

    expect(response.body.error.message).toBe('Ticket not found');
  });

  it('returns 404 when commenting on a soft-deleted ticket', async () => {
    const ticket = seed.ticketsByKey.t5;
    const customer = seed.usersByKey.customer;

    await request(app).delete(`/api/tickets/${ticket._id}`).expect(204);

    const response = await request(app)
      .post(`/api/tickets/${ticket._id}/comments`)
      .send({
        body: 'Comment on deleted ticket',
        authorId: customer._id.toString(),
      })
      .expect(404);

    expect(response.body.error.message).toBe('Ticket not found');
  });

  it('returns 404 when listing users by missing id', async () => {
    const missingId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/users/${missingId}`).expect(404);

    expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(response.body.error.message).toBe('User not found');
  });
});
