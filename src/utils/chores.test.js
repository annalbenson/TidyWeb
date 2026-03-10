import { describe, it, expect } from 'vitest';
import { buildStarterChores, daysUntilDue, dueLabel, choreStatus } from './chores';

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

    it('returns a negative value for an overdue chore', () => {
        const eightDaysAgo = new Date(Date.now() - 8 * 86400000);
        const chore = { frequency: 'Weekly', lastDone: { toDate: () => eightDaysAgo } };
        expect(daysUntilDue(chore)).toBeLessThan(0);
    });

    it('unknown frequency falls back to 7-day window', () => {
        // 8 days ago + unknown frequency should default to 7 days → overdue
        const eightDaysAgo = new Date(Date.now() - 8 * 86400000);
        const chore = { frequency: 'Bimonthly', lastDone: { toDate: () => eightDaysAgo } };
        expect(daysUntilDue(chore)).toBeLessThan(0);
    });

    it('accepts plain JS Date objects (no toDate) for lastDone', () => {
        const now = new Date();
        const chore = { frequency: 'Weekly', lastDone: now };
        expect(daysUntilDue(chore)).toBeGreaterThanOrEqual(6);
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

    it('returns "Due tomorrow" for 1', () => {
        expect(dueLabel(1)).toBe('Due tomorrow');
    });

    it('returns "Due in X days" for values greater than 1', () => {
        expect(dueLabel(5)).toBe('Due in 5 days');
        expect(dueLabel(30)).toBe('Due in 30 days');
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

describe('buildStarterChores', () => {
    it('returns an object with chores and rooms arrays', () => {
        const result = buildStarterChores({});
        expect(result).toHaveProperty('chores');
        expect(result).toHaveProperty('rooms');
        expect(Array.isArray(result.chores)).toBe(true);
        expect(Array.isArray(result.rooms)).toBe(true);
    });

    it('every chore has name, frequency, and room properties', () => {
        const { chores } = buildStarterChores({});
        const validFrequencies = ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'As needed'];
        for (const c of chores) {
            expect(typeof c.name).toBe('string');
            expect(validFrequencies).toContain(c.frequency);
            expect(c).toHaveProperty('room'); // may be null
        }
    });

    // ── Base chores ───────────────────────────────────────────────────────────

    it('base chores Vacuum, Mop floors, Dust surfaces are always included', () => {
        const { chores } = buildStarterChores({});
        expect(chores.find(c => c.name === 'Vacuum')).toBeDefined();
        expect(chores.find(c => c.name === 'Mop floors')).toBeDefined();
        expect(chores.find(c => c.name === 'Dust surfaces')).toBeDefined();
    });

    it('kitchen chores are always included', () => {
        const { chores } = buildStarterChores({});
        expect(chores.find(c => c.name === 'Wipe kitchen counters')).toBeDefined();
        expect(chores.find(c => c.name === 'Clean stovetop')).toBeDefined();
        expect(chores.find(c => c.name === 'Take out trash')).toBeDefined();
        expect(chores.find(c => c.name === 'Wash dishes')).toBeDefined();
    });

    // ── Bedrooms ──────────────────────────────────────────────────────────────

    it('single bedroom: no room instances, chore assigned to "Bedroom"', () => {
        const { chores, rooms } = buildStarterChores({ bedrooms: 1 });
        expect(rooms.filter(r => r.type === 'Bedroom')).toHaveLength(0);
        const sheetChores = chores.filter(c => c.name === 'Change bed sheets');
        expect(sheetChores).toHaveLength(1);
        expect(sheetChores[0].room).toBe('Bedroom');
    });

    it('multiple bedrooms (3): creates 3 room instances and assigns chore to each', () => {
        const { chores, rooms } = buildStarterChores({ bedrooms: 3 });
        const bedroomRooms = rooms.filter(r => r.type === 'Bedroom');
        expect(bedroomRooms).toHaveLength(3);
        expect(bedroomRooms[0]).toEqual({ name: 'Bedroom 1', type: 'Bedroom' });
        expect(bedroomRooms[1]).toEqual({ name: 'Bedroom 2', type: 'Bedroom' });
        expect(bedroomRooms[2]).toEqual({ name: 'Bedroom 3', type: 'Bedroom' });
        const sheetChores = chores.filter(c => c.name === 'Change bed sheets');
        expect(sheetChores).toHaveLength(3);
        expect(sheetChores.map(c => c.room)).toEqual(['Bedroom 1', 'Bedroom 2', 'Bedroom 3']);
    });

    it('5 bedrooms (UI max via "5+"): creates 5 room instances and 5 bed-sheet chores', () => {
        const { chores, rooms } = buildStarterChores({ bedrooms: 5 });
        expect(rooms.filter(r => r.type === 'Bedroom')).toHaveLength(5);
        const sheetChores = chores.filter(c => c.name === 'Change bed sheets');
        expect(sheetChores).toHaveLength(5);
        expect(sheetChores.map(c => c.room)).toEqual(['Bedroom 1', 'Bedroom 2', 'Bedroom 3', 'Bedroom 4', 'Bedroom 5']);
    });

    // ── Bathrooms ─────────────────────────────────────────────────────────────

    it('single bathroom: no room instances, exactly 3 chores assigned to "Bathroom"', () => {
        const { chores, rooms } = buildStarterChores({ bathrooms: 1 });
        expect(rooms.filter(r => r.type === 'Bathroom')).toHaveLength(0);
        const bathroomChores = chores.filter(c => c.room === 'Bathroom');
        expect(bathroomChores).toHaveLength(3);
    });

    it('single bathroom: chore names are "Wipe bathroom sink", "Scrub toilet", "Clean shower"', () => {
        const { chores } = buildStarterChores({ bathrooms: 1 });
        expect(chores.find(c => c.name === 'Wipe bathroom sink' && c.room === 'Bathroom')).toBeDefined();
        expect(chores.find(c => c.name === 'Scrub toilet' && c.room === 'Bathroom')).toBeDefined();
        expect(chores.find(c => c.name === 'Clean shower' && c.room === 'Bathroom')).toBeDefined();
    });

    it('multiple bathrooms (2): creates 2 room instances and assigns chores to each', () => {
        const { chores, rooms } = buildStarterChores({ bathrooms: 2 });
        const bathroomRooms = rooms.filter(r => r.type === 'Bathroom');
        expect(bathroomRooms).toHaveLength(2);
        expect(bathroomRooms[0]).toEqual({ name: 'Bathroom 1', type: 'Bathroom' });
        expect(bathroomRooms[1]).toEqual({ name: 'Bathroom 2', type: 'Bathroom' });
        expect(chores.filter(c => c.room === 'Bathroom 1')).toHaveLength(3);
        expect(chores.filter(c => c.room === 'Bathroom 2')).toHaveLength(3);
    });

    it('multi-bathroom chore names are "Wipe sink", "Scrub toilet", "Clean shower" (note: differs from single-bathroom "Wipe bathroom sink")', () => {
        const { chores } = buildStarterChores({ bathrooms: 2 });
        expect(chores.find(c => c.name === 'Wipe sink' && c.room === 'Bathroom 1')).toBeDefined();
        expect(chores.find(c => c.name === 'Scrub toilet' && c.room === 'Bathroom 1')).toBeDefined();
        expect(chores.find(c => c.name === 'Clean shower' && c.room === 'Bathroom 1')).toBeDefined();
    });

    it('4 bathrooms (UI max via "4+"): creates 4 room instances and 12 bathroom chores total', () => {
        const { chores, rooms } = buildStarterChores({ bathrooms: 4 });
        expect(rooms.filter(r => r.type === 'Bathroom')).toHaveLength(4);
        const bathroomChores = chores.filter(c => c.room?.startsWith('Bathroom '));
        expect(bathroomChores).toHaveLength(12);
    });

    // ── Laundry ───────────────────────────────────────────────────────────────

    it('laundromat: does not include a laundry chore', () => {
        const { chores } = buildStarterChores({ laundryType: 'Laundromat' });
        expect(chores.find(c => c.name === 'Do laundry')).toBeUndefined();
    });

    it('in-unit laundry: includes a laundry chore', () => {
        const { chores } = buildStarterChores({ laundryType: 'In-unit' });
        expect(chores.find(c => c.name === 'Do laundry')).toBeDefined();
    });

    it('"Shared in building" laundry: includes a laundry chore', () => {
        const { chores } = buildStarterChores({ laundryType: 'Shared in building' });
        expect(chores.find(c => c.name === 'Do laundry')).toBeDefined();
    });

    it('laundry chore is assigned to "Laundry Room"', () => {
        const { chores } = buildStarterChores({ laundryType: 'In-unit' });
        expect(chores.find(c => c.name === 'Do laundry')?.room).toBe('Laundry Room');
    });

    // ── Frequency scaling ─────────────────────────────────────────────────────

    it('"Pretty on top of it": Daily chores stay Daily', () => {
        const { chores } = buildStarterChores({ cleaningStyle: 'Pretty on top of it' });
        expect(chores.find(c => c.name === 'Wipe kitchen counters')?.frequency).toBe('Daily');
        expect(chores.find(c => c.name === 'Wash dishes')?.frequency).toBe('Daily');
    });

    it('"Pretty on top of it": Weekly and Biweekly chores are unchanged', () => {
        const { chores } = buildStarterChores({ cleaningStyle: 'Pretty on top of it' });
        expect(chores.find(c => c.name === 'Vacuum')?.frequency).toBe('Weekly');
        expect(chores.find(c => c.name === 'Mop floors')?.frequency).toBe('Biweekly');
    });

    it.each(['Weekly sweep', 'As-needed', "Honestly… it's chaos"])(
        '"%s": Daily chores are shifted to Weekly',
        (style) => {
            const { chores } = buildStarterChores({ cleaningStyle: style });
            expect(chores.find(c => c.name === 'Wipe kitchen counters')?.frequency).toBe('Weekly');
            expect(chores.find(c => c.name === 'Wash dishes')?.frequency).toBe('Weekly');
        }
    );

    it('non-Daily frequencies are never changed regardless of cleaning style', () => {
        for (const style of ['Weekly sweep', 'As-needed', "Honestly… it's chaos"]) {
            const { chores } = buildStarterChores({ cleaningStyle: style });
            expect(chores.find(c => c.name === 'Vacuum')?.frequency).toBe('Weekly');
            expect(chores.find(c => c.name === 'Mop floors')?.frequency).toBe('Biweekly');
        }
    });
});
