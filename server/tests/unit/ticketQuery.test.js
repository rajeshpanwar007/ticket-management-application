import { buildTicketListFilter, buildTicketListSort } from '../../src/domain/ticketQuery.js';

describe('ticketQuery', () => {
  describe('buildTicketListFilter', () => {
    it('always excludes soft-deleted tickets', () => {
      const { filter } = buildTicketListFilter();
      expect(filter.deletedAt).toBeNull();
    });

    it('combines status and keyword search filters', () => {
      const { filter, useTextSearch } = buildTicketListFilter({
        status: 'open',
        search: 'login issue',
      });

      expect(filter.status).toBe('open');
      expect(filter.$text).toEqual({ $search: 'login issue' });
      expect(useTextSearch).toBe(true);
    });

    it('uses case-insensitive regex fallback for special characters', () => {
      const { filter, useTextSearch } = buildTicketListFilter({
        search: 'login+api',
      });

      expect(filter.$or).toHaveLength(2);
      expect(filter.$or[0].title).toEqual(/login\+api/i);
      expect(useTextSearch).toBe(false);
    });
  });

  describe('buildTicketListSort', () => {
    it('sorts by relevance when text search is used', () => {
      expect(buildTicketListSort(true)).toEqual({
        score: { $meta: 'textScore' },
        createdAt: -1,
      });
    });

    it('sorts by createdAt when text search is not used', () => {
      expect(buildTicketListSort(false)).toEqual({ createdAt: -1 });
    });
  });
});
