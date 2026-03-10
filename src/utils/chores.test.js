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

describe('buildStarterChores', () => {
    it('returns an object with chores and rooms arrays', () => {
        const result = buildStarterChores({});
        expect(result).toHaveProperty('chores');
        expect(result).toHaveProperty('rooms');
        expect(Array.isArray(result.chores)).toBe(true);
        expect(Array.isArray(result.rooms)).toBe(true);
    });

    it('single bedroom: no room instances, chore assigned to "Bedroom"', () => {
        const { chores, rooms } = buildStarterChores({ bedrooms: 1 });
        const bedroomRooms = rooms.filter(r => r.type === 'Bedroom');
        expect(bedroomRooms).toHaveLength(0);
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

    it('single bathroom: no room instances, chore assigned to "Bathroom"', () => {
        const { chores, rooms } = buildStarterChores({ bathrooms: 1 });
        const bathroomRooms = rooms.filter(r => r.type === 'Bathroom');
        expect(bathroomRooms).toHaveLength(0);
        const bathroomChores = chores.filter(c => c.room === 'Bathroom');
        expect(bathroomChores.length).toBeGreaterThan(0);
    });

    it('multiple bathrooms (2): creates 2 room instances and assigns chores to each', () => {
        const { chores, rooms } = buildStarterChores({ bathrooms: 2 });
        const bathroomRooms = rooms.filter(r => r.type === 'Bathroom');
        expect(bathroomRooms).toHaveLength(2);
        expect(bathroomRooms[0]).toEqual({ name: 'Bathroom 1', type: 'Bathroom' });
        expect(bathroomRooms[1]).toEqual({ name: 'Bathroom 2', type: 'Bathroom' });
        const bath1Chores = chores.filter(c => c.room === 'Bathroom 1');
        const bath2Chores = chores.filter(c => c.room === 'Bathroom 2');
        expect(bath1Chores.length).toBeGreaterThan(0);
        expect(bath2Chores.length).toBeGreaterThan(0);
    });

    it('laundromat: does not include a laundry chore', () => {
        const { chores } = buildStarterChores({ laundryType: 'Laundromat' });
        expect(chores.find(c => c.name === 'Do laundry')).toBeUndefined();
    });

    it('in-unit laundry: includes a laundry chore', () => {
        const { chores } = buildStarterChores({ laundryType: 'In-unit' });
        expect(chores.find(c => c.name === 'Do laundry')).toBeDefined();
    });

    it('kitchen chores are always included', () => {
        const { chores } = buildStarterChores({});
        const kitchenChores = chores.filter(c => c.room === 'Kitchen');
        expect(kitchenChores.length).toBeGreaterThan(0);
        expect(chores.find(c => c.name === 'Wipe kitchen counters')).toBeDefined();
        expect(chores.find(c => c.name === 'Clean stovetop')).toBeDefined();
        expect(chores.find(c => c.name === 'Take out trash')).toBeDefined();
        expect(chores.find(c => c.name === 'Wash dishes')).toBeDefined();
    });
});
