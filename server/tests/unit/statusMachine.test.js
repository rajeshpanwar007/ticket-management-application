import {
  allowedNextStatuses,
  canTransition,
  formatStatusLabel,
  isTerminal,
  TRANSITIONS,
} from '../../src/domain/statusMachine.js';

describe('statusMachine', () => {
  describe('TRANSITIONS', () => {
    it('defines the required lifecycle paths', () => {
      expect(TRANSITIONS).toEqual({
        open: ['in_progress', 'cancelled'],
        in_progress: ['resolved', 'cancelled'],
        resolved: ['closed'],
        closed: [],
        cancelled: [],
      });
    });
  });

  describe('canTransition', () => {
    const validTransitions = [
      ['open', 'in_progress'],
      ['open', 'cancelled'],
      ['in_progress', 'resolved'],
      ['in_progress', 'cancelled'],
      ['resolved', 'closed'],
    ];

    it.each(validTransitions)('allows %s -> %s', (from, to) => {
      expect(canTransition(from, to)).toBe(true);
    });

    const invalidTransitions = [
      ['open', 'resolved'],
      ['open', 'closed'],
      ['in_progress', 'open'],
      ['in_progress', 'closed'],
      ['resolved', 'open'],
      ['resolved', 'in_progress'],
      ['resolved', 'cancelled'],
      ['closed', 'open'],
      ['closed', 'in_progress'],
      ['cancelled', 'open'],
      ['cancelled', 'in_progress'],
    ];

    it.each(invalidTransitions)('rejects %s -> %s', (from, to) => {
      expect(canTransition(from, to)).toBe(false);
    });

    it('rejects unknown statuses', () => {
      expect(canTransition('invalid', 'open')).toBe(false);
      expect(canTransition('open', 'invalid')).toBe(false);
    });

    it('rejects no-op transitions from terminal states', () => {
      expect(canTransition('closed', 'closed')).toBe(false);
      expect(canTransition('cancelled', 'cancelled')).toBe(false);
    });
  });

  describe('allowedNextStatuses', () => {
    it('returns valid next states for each non-terminal status', () => {
      expect(allowedNextStatuses('open')).toEqual(['in_progress', 'cancelled']);
      expect(allowedNextStatuses('in_progress')).toEqual(['resolved', 'cancelled']);
      expect(allowedNextStatuses('resolved')).toEqual(['closed']);
      expect(allowedNextStatuses('closed')).toEqual([]);
      expect(allowedNextStatuses('cancelled')).toEqual([]);
    });
  });

  describe('isTerminal', () => {
    it('identifies terminal states', () => {
      expect(isTerminal('closed')).toBe(true);
      expect(isTerminal('cancelled')).toBe(true);
    });

    it('identifies non-terminal states', () => {
      expect(isTerminal('open')).toBe(false);
      expect(isTerminal('in_progress')).toBe(false);
      expect(isTerminal('resolved')).toBe(false);
    });
  });

  describe('formatStatusLabel', () => {
    it('returns human-readable labels', () => {
      expect(formatStatusLabel('in_progress')).toBe('In Progress');
      expect(formatStatusLabel('open')).toBe('Open');
    });
  });
});
