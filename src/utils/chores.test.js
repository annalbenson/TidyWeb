import { describe, it, expect } from 'vitest';
import { daysUntilDue, dueLabel, choreStatus } from './chores';

describe('daysUntilDue', () => {
    it('returns Infinity for As needed chores', () => {
        expect(daysUntilDue({ frequency: 'As needed' })).toBe(Infinity);
    });

    it('falls back to createdAt when lastDone is null', () => {
        const now = new Date();
        const chore = { frequency: 'Weekly', lastDone: null, createdAt: { toDate: () => now } };
        // ~7 days; Math.floor can return 6 due to sub-millisecond elapsed time
        expect(daysUntilDue(chore)).toBeGreaterThanOrEqual(6);
    });
    it('returns -1 when both lastDone and createdAt are null', () => {
        expect(daysUntilDue({ frequency: 'Weekly', lastDone: null, createdAt: null })).toBe(-1);
    });
});

describe('dueLabel', () => {
    it('returns "No schedule" for Infinity', () => {
        expect(dueLabel(Infinity)).toBe('No schedule');
    });

    it('returns "Overdue" for negative days', () => {
        expect(dueLabel(-3)).toBe('Overdue');
    });

    it('returns "Due today" for 0', () => {
        expect(dueLabel(0)).toBe('Due today');
    });
});

describe('choreStatus', () => {
    it('returns null for As needed chores', () => {
        expect(choreStatus({ frequency: 'As needed' })).toBeNull();
    });

    it('returns overdue when never done and no createdAt', () => {
        expect(choreStatus({ frequency: 'Weekly', lastDone: null, createdAt: null })).toBe('overdue');
    });
    it('returns upcoming for a freshly created chore', () => {
        const now = new Date();
        expect(choreStatus({ frequency: 'Weekly', lastDone: null, createdAt: { toDate: () => now } })).toBe('upcoming');
    });
});
