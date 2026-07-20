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

describe('Ticket Search and Filter Integration', () => {
  describe('keyword search', () => {
    const searchCases = [
      { query: 'login', expectedTitle: 'Cannot login to account' },
      { query: 'password', expectedTitle: 'Password reset email not received' },
      { query: 'API', expectedTitle: 'API integration timeout errors' },
      { query: 'mobile', expectedTitle: 'Mobile app crashes on startup' },
      { query: 'export', expectedTitle: 'Feature request: export to CSV' },
      { query: 'LOGIN', expectedTitle: 'Cannot login to account' },
      { query: 'nonexistent-term', expectedCount: 0 },
    ];

    it.each(searchCases)(
      'search=$query returns expected results',
      async ({ query, expectedTitle, expectedCount }) => {
        const response = await request(app).get(`/api/tickets?search=${query}`).expect(200);

        if (expectedCount === 0) {
          expect(response.body.total).toBe(0);
          expect(response.body.tickets).toHaveLength(0);
          return;
        }

        expect(response.body.total).toBeGreaterThanOrEqual(1);
        expect(response.body.tickets.some((ticket) => ticket.title === expectedTitle)).toBe(true);
      },
    );
  });

  describe('status filter', () => {
    it('filters tickets by status', async () => {
      const response = await request(app).get('/api/tickets?status=open').expect(200);

      expect(response.body.total).toBe(4);
      expect(response.body.tickets.every((ticket) => ticket.status === 'open')).toBe(true);
    });

    it('returns only cancelled tickets', async () => {
      const response = await request(app).get('/api/tickets?status=cancelled').expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.tickets[0].title).toBe('Duplicate ticket - please ignore');
    });
  });

  describe('combined filters', () => {
    it('applies search and status together', async () => {
      const response = await request(app)
        .get('/api/tickets?search=login&status=open')
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.tickets[0]._id).toBe(seed.ticketsByKey.t1._id.toString());
    });
  });

  describe('pagination', () => {
    it('returns paginated results with metadata', async () => {
      const response = await request(app).get('/api/tickets?page=2&limit=3').expect(200);

      expect(response.body.total).toBe(8);
      expect(response.body.tickets).toHaveLength(3);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(3);
      expect(response.body.totalPages).toBe(3);
    });
  });

  describe('validation', () => {
    it('returns 400 for invalid status filter values', async () => {
      const response = await request(app).get('/api/tickets?status=invalid').expect(400);

      expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it('returns 400 for invalid pagination values', async () => {
      const response = await request(app).get('/api/tickets?page=0').expect(400);

      expect(response.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });
  });
});
