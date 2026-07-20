import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { User, Ticket, Comment } from '../../src/models/index.js';

let mongoServer;
let app;

const createUser = (overrides = {}) =>
  User.create({
    name: 'Test User',
    email: `user-${Date.now()}-${Math.random()}@demo.com`,
    ...overrides,
  });

const createTicket = async (createdBy, overrides = {}) =>
  Ticket.create({
    title: 'Support request',
    description: 'Need help with account access.',
    priority: 'medium',
    createdBy,
    ...overrides,
  });

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

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Ticket.deleteMany({}), Comment.deleteMany({})]);
});

describe('Comment API', () => {
  describe('GET /api/tickets/:id/comments', () => {
    it('returns comments in chronological order', async () => {
      const author = await createUser();
      const ticket = await createTicket(author._id);

      await Comment.create({
        ticketId: ticket._id,
        authorId: author._id,
        body: 'First update',
        createdAt: new Date('2026-01-01T10:00:00Z'),
      });
      await Comment.create({
        ticketId: ticket._id,
        authorId: author._id,
        body: 'Second update',
        createdAt: new Date('2026-01-01T11:00:00Z'),
      });

      const response = await request(app)
        .get(`/api/tickets/${ticket._id}/comments`)
        .expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.comments).toHaveLength(2);
      expect(response.body.comments[0].body).toBe('First update');
      expect(response.body.comments[1].body).toBe('Second update');
      expect(response.body.comments[0].authorId.name).toBe(author.name);
    });

    it('returns an empty list when a ticket has no comments', async () => {
      const author = await createUser();
      const ticket = await createTicket(author._id);

      const response = await request(app)
        .get(`/api/tickets/${ticket._id}/comments`)
        .expect(200);

      expect(response.body).toEqual({ comments: [], total: 0 });
    });

    it('returns 404 when the ticket does not exist', async () => {
      const missingId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/tickets/${missingId}/comments`)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Ticket not found');
    });

    it('returns 404 when the ticket is soft deleted', async () => {
      const author = await createUser();
      const ticket = await createTicket(author._id, { deletedAt: new Date() });

      const response = await request(app)
        .get(`/api/tickets/${ticket._id}/comments`)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/tickets/:id/comments', () => {
    it('creates a comment and returns 201 with populated author', async () => {
      const author = await createUser({ name: 'Comment Author' });
      const ticket = await createTicket(author._id);
      const originalUpdatedAt = ticket.updatedAt;

      const response = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .send({
          body: 'Please reset my password.',
          authorId: author._id.toString(),
        })
        .expect(201);

      expect(response.body.comment).toMatchObject({
        body: 'Please reset my password.',
        ticketId: ticket._id.toString(),
      });
      expect(response.body.comment.authorId).toMatchObject({
        name: 'Comment Author',
        email: author.email,
        role: author.role,
      });
      expect(response.body.comment.createdAt).toBeDefined();

      const refreshedTicket = await Ticket.findById(ticket._id);
      expect(refreshedTicket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('returns 400 when validation fails', async () => {
      const author = await createUser();
      const ticket = await createTicket(author._id);

      const response = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .send({ body: '', authorId: author._id.toString() })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.body).toBeDefined();
    });

    it('returns 404 when the ticket does not exist', async () => {
      const author = await createUser();
      const missingId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/tickets/${missingId}/comments`)
        .send({
          body: 'Orphan comment',
          authorId: author._id.toString(),
        })
        .expect(404);

      expect(response.body.error.message).toBe('Ticket not found');
    });

    it('returns 404 when the author does not exist', async () => {
      const author = await createUser();
      const ticket = await createTicket(author._id);
      const missingAuthorId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/tickets/${ticket._id}/comments`)
        .send({
          body: 'Comment from missing user',
          authorId: missingAuthorId.toString(),
        })
        .expect(404);

      expect(response.body.error.message).toBe('Author not found');
    });
  });
});
