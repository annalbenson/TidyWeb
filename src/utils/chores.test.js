import { describe, it, expect } from 'vitest';
import { daysUntilDue, dueLabel, choreStatus } from './chores';

describe('daysUntilDue', () => {
    it('returns Infinity for As needed chores', () => {
        expect(daysUntilDue({ frequency: 'As needed' })).toBe(Infinity);
    });

    it('returns -1 when chore has never been done', () => {
        expect(daysUntilDue({ frequency: 'Weekly', lastDone: null })).toBe(-1);
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

    it('returns overdue when never done', () => {
        expect(choreStatus({ frequency: 'Weekly', lastDone: null })).toBe('overdue');
    });
});
