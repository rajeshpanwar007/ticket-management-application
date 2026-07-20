import mongoose from 'mongoose';
import request from 'supertest';
import { Ticket } from '../../src/models/index.js';
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

describe('Ticket CRUD Integration', () => {
  describe('CREATE', () => {
    it('creates a ticket with required fields and defaults', async () => {
      const customer = seed.usersByKey.customer;

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'New integration ticket',
          description: 'Created during CRUD integration tests.',
          createdBy: customer._id.toString(),
        })
        .expect(201);

      expect(response.body.ticket).toMatchObject({
        title: 'New integration ticket',
        status: 'open',
        priority: 'medium',
      });
      expect(response.body.ticket.createdBy._id).toBe(customer._id.toString());
      expect(response.body.ticket.allowedNextStatuses).toEqual(['in_progress', 'cancelled']);
    });

    it('creates a ticket with priority and assignee', async () => {
      const customer = seed.usersByKey.customer;
      const agent = seed.usersByKey.agent;

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Assigned ticket',
          description: 'Assigned to an agent on create.',
          priority: 'high',
          createdBy: customer._id.toString(),
          assignedTo: agent._id.toString(),
        })
        .expect(201);

      expect(response.body.ticket.priority).toBe('high');
      expect(response.body.ticket.assignedTo._id).toBe(agent._id.toString());
    });

    it('returns 404 when createdBy user does not exist', async () => {
      const missingUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/tickets')
        .send({
          title: 'Orphan ticket',
          description: 'Missing creator reference.',
          createdBy: missingUserId.toString(),
        })
        .expect(404);

      expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
    });
  });

  describe('READ', () => {
    it('lists seeded tickets with pagination metadata', async () => {
      const response = await request(app).get('/api/tickets').expect(200);

      expect(response.body.total).toBe(8);
      expect(response.body.tickets).toHaveLength(8);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });

    it('returns a single ticket with populated users and comments', async () => {
      const ticket = seed.ticketsByKey.t1;

      const response = await request(app).get(`/api/tickets/${ticket._id}`).expect(200);

      expect(response.body.ticket.title).toBe('Cannot login to account');
      expect(response.body.ticket.createdBy.name).toBe('Alice Customer');
      expect(response.body.ticket.assignedTo.name).toBe('Bob Agent');
      expect(response.body.ticket.comments).toHaveLength(3);
    });

    it('returns 404 for a missing ticket', async () => {
      const missingId = new mongoose.Types.ObjectId();

      await request(app).get(`/api/tickets/${missingId}`).expect(404);
    });
  });

  describe('UPDATE', () => {
    it('updates mutable ticket fields', async () => {
      const ticket = seed.ticketsByKey.t5;
      const agent = seed.usersByKey.agent;

      const response = await request(app)
        .patch(`/api/tickets/${ticket._id}`)
        .send({
          title: 'Updated CSV export request',
          description: 'Updated description for export feature.',
          priority: 'high',
          assignedTo: agent._id.toString(),
        })
        .expect(200);

      expect(response.body.ticket.title).toBe('Updated CSV export request');
      expect(response.body.ticket.priority).toBe('high');
      expect(response.body.ticket.assignedTo._id).toBe(agent._id.toString());

      const persisted = await Ticket.findById(ticket._id);
      expect(persisted.title).toBe('Updated CSV export request');
    });

    it('clears assignment when assignedTo is null', async () => {
      const ticket = seed.ticketsByKey.t1;

      const response = await request(app)
        .patch(`/api/tickets/${ticket._id}`)
        .send({ assignedTo: null })
        .expect(200);

      expect(response.body.ticket.assignedTo).toBeNull();
    });

    it('returns 404 when reassigning to a missing user', async () => {
      const ticket = seed.ticketsByKey.t8;
      const missingUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/tickets/${ticket._id}`)
        .send({ assignedTo: missingUserId.toString() })
        .expect(404);

      expect(response.body.error.message).toBe('Assignee not found');
    });
  });

  describe('DELETE', () => {
    it('soft deletes a ticket and excludes it from reads and lists', async () => {
      const ticket = seed.ticketsByKey.t8;

      await request(app).delete(`/api/tickets/${ticket._id}`).expect(204);
      await request(app).get(`/api/tickets/${ticket._id}`).expect(404);

      const listResponse = await request(app).get('/api/tickets').expect(200);
      expect(listResponse.body.total).toBe(7);

      const persisted = await Ticket.findById(ticket._id);
      expect(persisted.deletedAt).toBeInstanceOf(Date);
    });

    it('returns 404 when deleting a missing ticket', async () => {
      const missingId = new mongoose.Types.ObjectId();
      await request(app).delete(`/api/tickets/${missingId}`).expect(404);
    });
  });
});
