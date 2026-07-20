import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { User, Ticket } from '../../src/models/index.js';

let mongoServer;
let app;

const createUser = (overrides = {}) =>
  User.create({
    name: 'Test User',
    email: `user-${Date.now()}-${Math.random()}@demo.com`,
    ...overrides,
  });

const createTicketPayload = (createdBy, overrides = {}) => ({
  title: 'Login page broken',
  description: 'Users cannot sign in with valid credentials.',
  priority: 'high',
  createdBy: createdBy.toString(),
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
  await Promise.all([User.deleteMany({}), Ticket.deleteMany({})]);
});

describe('Ticket API', () => {
  describe('POST /api/tickets', () => {
    it('creates a ticket and returns 201', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      expect(response.body.ticket).toMatchObject({
        title: 'Login page broken',
        description: 'Users cannot sign in with valid credentials.',
        priority: 'high',
        status: 'open',
      });
      expect(response.body.ticket.createdBy._id).toBe(user._id.toString());
      expect(response.body.ticket.allowedNextStatuses).toEqual(['in_progress', 'cancelled']);
    });

    it('returns 400 when validation fails', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({ title: '' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('returns 404 when createdBy user does not exist', async () => {
      const missingUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(missingUserId))
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 404 when assignee does not exist', async () => {
      const user = await createUser();
      const missingAssigneeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { assignedTo: missingAssigneeId.toString() }))
        .expect(404);

      expect(response.body.error.message).toMatch(/Assignee/);
    });
  });

  describe('GET /api/tickets', () => {
    it('returns all active tickets', async () => {
      const user = await createUser();

      await request(app).post('/api/tickets').send(createTicketPayload(user._id));
      await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Email notifications delayed' }));

      const response = await request(app).get('/api/tickets').expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.tickets).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
      expect(response.body.totalPages).toBe(1);
    });

    it('filters tickets by status', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      const response = await request(app).get('/api/tickets?status=in_progress').expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.tickets[0].status).toBe('in_progress');
    });

    it('searches tickets by title or description', async () => {
      const user = await createUser();

      await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Billing issue' }));
      await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Unrelated ticket' }));

      const response = await request(app).get('/api/tickets?search=billing').expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.tickets[0].title).toBe('Billing issue');
    });

    it('performs case-insensitive keyword search', async () => {
      const user = await createUser();

      await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Login page broken' }));

      const response = await request(app).get('/api/tickets?search=LOGIN').expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.tickets[0].title).toBe('Login page broken');
    });

    it('combines keyword search and status filters', async () => {
      const user = await createUser();

      const openTicket = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Login page broken' }))
        .expect(201);

      await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Login API timeout' }))
        .expect(201);

      await request(app)
        .patch(`/api/tickets/${openTicket.body.ticket._id}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      const response = await request(app)
        .get('/api/tickets?search=login&status=open')
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.tickets[0].title).toBe('Login API timeout');
    });

    it('returns paginated results with metadata', async () => {
      const user = await createUser();

      for (let index = 0; index < 5; index += 1) {
        await request(app)
          .post('/api/tickets')
          .send(createTicketPayload(user._id, { title: `Ticket ${index + 1}` }));
      }

      const response = await request(app)
        .get('/api/tickets?page=2&limit=2')
        .expect(200);

      expect(response.body.total).toBe(5);
      expect(response.body.tickets).toHaveLength(2);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.totalPages).toBe(3);
    });

    it('returns 400 for invalid pagination query params', async () => {
      const response = await request(app).get('/api/tickets?page=0').expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('returns a ticket by id', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      const response = await request(app)
        .get(`/api/tickets/${created.body.ticket._id}`)
        .expect(200);

      expect(response.body.ticket._id).toBe(created.body.ticket._id);
      expect(response.body.ticket.allowedNextStatuses).toEqual(['in_progress', 'cancelled']);
    });

    it('returns 404 for a missing ticket', async () => {
      const missingId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/tickets/${missingId}`).expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    it('updates ticket fields', async () => {
      const creator = await createUser({ role: 'customer' });
      const assignee = await createUser({ role: 'agent', email: `agent-${Date.now()}@demo.com` });

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(creator._id))
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}`)
        .send({
          title: 'Updated title',
          priority: 'low',
          assignedTo: assignee._id.toString(),
        })
        .expect(200);

      expect(response.body.ticket.title).toBe('Updated title');
      expect(response.body.ticket.priority).toBe('low');
      expect(response.body.ticket.assignedTo._id).toBe(assignee._id.toString());
    });

    it('returns 400 when no updatable fields are provided', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects status updates on the general patch endpoint', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}`)
        .send({ status: 'in_progress' })
        .expect(400);

      expect(response.body.error.details.status).toMatch(/status/i);
    });
  });

  describe('PATCH /api/tickets/:id/status', () => {
    it('applies valid status transitions', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.ticket.status).toBe('in_progress');
      expect(response.body.ticket.allowedNextStatuses).toEqual(['resolved', 'cancelled']);
    });

    it('allows cancelling from open and in progress', async () => {
      const user = await createUser();

      const openTicket = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      await request(app)
        .patch(`/api/tickets/${openTicket.body.ticket._id}/status`)
        .send({ status: 'cancelled' })
        .expect(200);

      const inProgressTicket = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id, { title: 'Second ticket' }))
        .expect(201);

      await request(app)
        .patch(`/api/tickets/${inProgressTicket.body.ticket._id}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      const response = await request(app)
        .patch(`/api/tickets/${inProgressTicket.body.ticket._id}/status`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body.ticket.status).toBe('cancelled');
      expect(response.body.ticket.allowedNextStatuses).toEqual([]);
    });

    it('returns 409 for invalid transitions', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      const response = await request(app)
        .patch(`/api/tickets/${created.body.ticket._id}/status`)
        .send({ status: 'closed' })
        .expect(409);

      expect(response.body.error.code).toBe('INVALID_TRANSITION');
      expect(response.body.error.message).toMatch(/Cannot change status from Open to Closed/);
      expect(response.body.error.message).toMatch(/In Progress, Cancelled/);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('soft deletes a ticket and hides it from subsequent reads', async () => {
      const user = await createUser();

      const created = await request(app)
        .post('/api/tickets')
        .send(createTicketPayload(user._id))
        .expect(201);

      await request(app).delete(`/api/tickets/${created.body.ticket._id}`).expect(204);

      await request(app).get(`/api/tickets/${created.body.ticket._id}`).expect(404);

      const listResponse = await request(app).get('/api/tickets').expect(200);
      expect(listResponse.body.total).toBe(0);

      const deletedTicket = await Ticket.findById(created.body.ticket._id);
      expect(deletedTicket.deletedAt).toBeInstanceOf(Date);
    });

    it('returns 404 when deleting a missing ticket', async () => {
      const missingId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/tickets/${missingId}`).expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
