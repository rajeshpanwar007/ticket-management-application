import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { User, Ticket, Comment } from '../../src/models/index.js';
import {
  COMMENT_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  VALIDATION_ERROR_CODE,
  VALIDATION_ERROR_MESSAGE,
} from '../../src/constants/validation.constants.js';

let mongoServer;
let app;

const createUser = (overrides = {}) =>
  User.create({
    name: 'Validation User',
    email: `validation-${Date.now()}-${Math.random()}@demo.com`,
    ...overrides,
  });

const expectValidationError = (response, expectedDetails = {}) => {
  expect(response.body.error).toEqual({
    code: VALIDATION_ERROR_CODE,
    message: VALIDATION_ERROR_MESSAGE,
    details: expect.objectContaining(expectedDetails),
  });
};

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

describe('Backend validation', () => {
  describe('Ticket title and description', () => {
    it('rejects create requests with missing title and description', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send({ createdBy: user._id.toString() })
        .expect(400);

      expectValidationError(response, {
        title: 'Title is required',
        description: 'Description is required',
      });
    });

    it('rejects non-string title and description values', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 123,
          description: ['invalid'],
          createdBy: user._id.toString(),
        })
        .expect(400);

      expectValidationError(response, {
        title: 'Title must be a string',
        description: 'Description must be a string',
      });
    });

    it('rejects values that exceed max lengths', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'a'.repeat(TITLE_MAX_LENGTH + 1),
          description: 'b'.repeat(DESCRIPTION_MAX_LENGTH + 1),
          createdBy: user._id.toString(),
        })
        .expect(400);

      expectValidationError(response, {
        title: `Title cannot exceed ${TITLE_MAX_LENGTH} characters`,
        description: `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`,
      });
    });
  });

  describe('Ticket priority', () => {
    it('rejects invalid priority values on create', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Priority test',
          description: 'Valid description',
          priority: 'urgent',
          createdBy: user._id.toString(),
        })
        .expect(400);

      expectValidationError(response, {
        priority: 'Priority must be one of: low, medium, high',
      });
    });
  });

  describe('Ticket status', () => {
    it('rejects status on create', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Status test',
          description: 'Valid description',
          createdBy: user._id.toString(),
          status: 'closed',
        })
        .expect(400);

      expectValidationError(response, {
        status: 'Status cannot be set on create; tickets always start as open',
      });
    });

    it('rejects invalid status values on the status endpoint', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Status endpoint test',
          description: 'Valid description',
          createdBy: user._id.toString(),
        })
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}/status`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expectValidationError(response, {
        status: 'Status must be one of: open, in_progress, resolved, closed, cancelled',
      });
    });

    it('rejects status updates on the general ticket patch endpoint', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send({
          title: 'General patch test',
          description: 'Valid description',
          createdBy: user._id.toString(),
        })
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}`)
        .send({ status: 'in_progress' })
        .expect(400);

      expectValidationError(response, {
        status: 'Use PATCH /api/tickets/:id/status to update status',
      });
    });
  });

  describe('Ticket assignment', () => {
    it('rejects invalid assignment values on create', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Assignment test',
          description: 'Valid description',
          createdBy: user._id.toString(),
          assignedTo: 'not-a-valid-id',
        })
        .expect(400);

      expectValidationError(response, {
        assignedTo: 'Assignment must be a valid user ID or null',
      });
    });

    it('allows null assignment on update', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Clear assignment',
          description: 'Valid description',
          createdBy: user._id.toString(),
        })
        .expect(201);

      await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}`)
        .send({ assignedTo: null })
        .expect(200);
    });
  });

  describe('Comment validation', () => {
    it('rejects missing or invalid comment body', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Comment validation ticket',
          description: 'Valid description',
          createdBy: user._id.toString(),
        })
        .expect(201);

      const response = await request(app)
        .post(`/api/tickets/${created.body.ticket._id}/comments`)
        .send({ authorId: user._id.toString() })
        .expect(400);

      expectValidationError(response, {
        body: 'Comment body is required',
      });
    });

    it('rejects comment bodies that exceed the max length', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Long comment ticket',
          description: 'Valid description',
          createdBy: user._id.toString(),
        })
        .expect(201);

      const response = await request(app)
        .post(`/api/tickets/${created.body.ticket._id}/comments`)
        .send({
          body: 'c'.repeat(COMMENT_MAX_LENGTH + 1),
          authorId: user._id.toString(),
        })
        .expect(400);

      expectValidationError(response, {
        body: `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`,
      });
    });

    it('rejects invalid author IDs', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Author validation ticket',
          description: 'Valid description',
          createdBy: user._id.toString(),
        })
        .expect(201);

      const response = await request(app)
        .post(`/api/tickets/${created.body.ticket._id}/comments`)
        .send({
          body: 'Valid comment',
          authorId: 'invalid-author',
        })
        .expect(400);

      expectValidationError(response, {
        authorId: 'Invalid Author',
      });
    });
  });
});
