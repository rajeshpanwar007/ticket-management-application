import mongoose from 'mongoose';
import request from 'supertest';
import { Ticket } from '../../src/models/index.js';
import { ERROR_CODES } from '../../src/errors/index.js';
import { STATUS_LABELS } from '../../src/domain/statusMachine.js';
import {
  connectIntegrationEnvironment,
  disconnectIntegrationEnvironment,
  getIntegrationApp,
  getSeedResult,
  seedIntegrationDatabase,
} from '../helpers/testEnvironment.js';

let app;
let seed;

const transition = (ticketId, status) =>
  request(app).patch(`/api/tickets/${ticketId}/status`).send({ status });

const expectInvalidTransition = (response, fromStatus, toStatus) => {
  expect(response.body.error.code).toBe(ERROR_CODES.INVALID_TRANSITION);
  expect(response.body.error.message).toBe(
    `Cannot change status from ${STATUS_LABELS[fromStatus]} to ${STATUS_LABELS[toStatus]}. Allowed transitions from ${STATUS_LABELS[fromStatus]}: ${getAllowedLabelList(fromStatus)}.`,
  );
};

const getAllowedLabelList = (status) => {
  const labels = {
    open: 'In Progress, Cancelled',
    in_progress: 'Resolved, Cancelled',
    resolved: 'Closed',
    closed: 'none',
    cancelled: 'none',
  };

  return labels[status];
};

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

describe('Ticket State Machine Integration', () => {
  describe('valid transitions', () => {
    const validCases = [
      { ticketKey: 't1', from: 'open', to: 'in_progress' },
      { ticketKey: 't5', from: 'open', to: 'cancelled' },
      { ticketKey: 't2', from: 'in_progress', to: 'resolved' },
      { ticketKey: 't2', from: 'in_progress', to: 'cancelled' },
      { ticketKey: 't3', from: 'resolved', to: 'closed' },
    ];

    it.each(validCases)(
      'returns 200 when $ticketKey transitions from $from to $to',
      async ({ ticketKey, from, to }) => {
        const ticket = seed.ticketsByKey[ticketKey];
        expect(ticket.status).toBe(from);

        const response = await transition(ticket._id, to).expect(200);

        expect(response.body.ticket.status).toBe(to);

        const persisted = await Ticket.findById(ticket._id);
        expect(persisted.status).toBe(to);
      },
    );

    it('completes the full lifecycle open → in_progress → resolved → closed', async () => {
      const ticket = seed.ticketsByKey.t7;
      expect(ticket.status).toBe('open');

      await transition(ticket._id, 'in_progress').expect(200);
      await transition(ticket._id, 'resolved').expect(200);
      const response = await transition(ticket._id, 'closed').expect(200);

      expect(response.body.ticket.status).toBe('closed');
      expect(response.body.ticket.allowedNextStatuses).toEqual([]);

      const persisted = await Ticket.findById(ticket._id);
      expect(persisted.status).toBe('closed');
    });

    it('returns 200 when submitting the current status (no-op)', async () => {
      const ticket = seed.ticketsByKey.t1;

      const response = await transition(ticket._id, 'open').expect(200);

      expect(response.body.ticket.status).toBe('open');

      const persisted = await Ticket.findById(ticket._id);
      expect(persisted.status).toBe('open');
    });
  });

  describe('invalid transitions', () => {
    const invalidCases = [
      { ticketKey: 't1', from: 'open', to: 'closed' },
      { ticketKey: 't1', from: 'open', to: 'resolved' },
      { ticketKey: 't5', from: 'open', to: 'closed' },
      { ticketKey: 't2', from: 'in_progress', to: 'open' },
      { ticketKey: 't2', from: 'in_progress', to: 'closed' },
      { ticketKey: 't3', from: 'resolved', to: 'open' },
      { ticketKey: 't3', from: 'resolved', to: 'cancelled' },
      { ticketKey: 't4', from: 'closed', to: 'in_progress' },
      { ticketKey: 't6', from: 'cancelled', to: 'open' },
    ];

    it.each(invalidCases)(
      'returns 409 when $ticketKey attempts invalid transition from $from to $to',
      async ({ ticketKey, from, to }) => {
        const ticket = seed.ticketsByKey[ticketKey];
        expect(ticket.status).toBe(from);

        const response = await transition(ticket._id, to).expect(409);

        expectInvalidTransition(response, from, to);

        const persisted = await Ticket.findById(ticket._id);
        expect(persisted.status).toBe(from);
      },
    );
  });

  describe('validation and not found handling', () => {
    it('returns 400 for an invalid status value', async () => {
      const ticket = seed.ticketsByKey.t1;

      const response = await transition(ticket._id, 'not-a-status').expect(400);

      expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(response.body.error.details.status).toMatch(/Status must be one of/);

      const persisted = await Ticket.findById(ticket._id);
      expect(persisted.status).toBe('open');
    });

    it('returns 404 when the ticket does not exist', async () => {
      const missingId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/tickets/${missingId}/status`)
        .send({ status: 'in_progress' })
        .expect(404);

      expect(response.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
      expect(response.body.error.message).toBe('Ticket not found');
    });
  });

  describe('seeded ticket baseline', () => {
    it('seeds tickets in expected statuses before each test run', () => {
      expect(seed.ticketsByKey.t1.status).toBe('open');
      expect(seed.ticketsByKey.t2.status).toBe('in_progress');
      expect(seed.ticketsByKey.t3.status).toBe('resolved');
      expect(seed.ticketsByKey.t4.status).toBe('closed');
      expect(seed.ticketsByKey.t5.status).toBe('open');
      expect(seed.ticketsByKey.t6.status).toBe('cancelled');
    });
  });
});
