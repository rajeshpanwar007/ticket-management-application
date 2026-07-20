import mongoose from 'mongoose';
import request from 'supertest';
import { Comment } from '../../src/models/index.js';
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

describe('Comment API with Seed Data', () => {
  describe('GET /api/tickets/:id/comments', () => {
    it('returns seeded comments for T1 in chronological order', async () => {
      const ticket = seed.ticketsByKey.t1;

      const response = await request(app)
        .get(`/api/tickets/${ticket._id}/comments`)
        .expect(200);

      expect(response.body.total).toBe(3);
      expect(response.body.comments[0].body).toMatch(/account is locked/i);
      expect(response.body.comments[1].body).toMatch(/account has been unlocked/i);
      expect(response.body.comments[2].body).toMatch(/login successfully/i);
      expect(response.body.comments[0].authorId.name).toBe('Bob Agent');
      expect(response.body.comments[2].authorId.name).toBe('Alice Customer');
    });

    it('returns an empty list for tickets without comments', async () => {
      const ticket = seed.ticketsByKey.t5;

      const response = await request(app)
        .get(`/api/tickets/${ticket._id}/comments`)
        .expect(200);

      expect(response.body).toEqual({ comments: [], total: 0 });
    });
  });

  describe('POST /api/tickets/:id/comments', () => {
    it('creates a comment on a ticket without existing comments', async () => {
      const ticket = seed.ticketsByKey.t5;
      const customer = seed.usersByKey.customer;

      const response = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .send({
          body: 'Any update on the CSV export request?',
          authorId: customer._id.toString(),
        })
        .expect(201);

      expect(response.body.comment.body).toBe('Any update on the CSV export request?');
      expect(response.body.comment.authorId.name).toBe('Alice Customer');

      const persisted = await Comment.find({ ticketId: ticket._id });
      expect(persisted).toHaveLength(1);
    });

    it('returns 404 when author does not exist', async () => {
      const ticket = seed.ticketsByKey.t8;
      const missingAuthorId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .send({
          body: 'Missing author comment',
          authorId: missingAuthorId.toString(),
        })
        .expect(404);

      expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(response.body.error.message).toBe('Author not found');
    });

    it('returns 400 when comment body is missing', async () => {
      const ticket = seed.ticketsByKey.t8;
      const customer = seed.usersByKey.customer;

      const response = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .send({ authorId: customer._id.toString() })
        .expect(400);

      expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(response.body.error.details.body).toBe('Comment body is required');
    });
  });
});
