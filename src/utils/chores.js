export const FREQ_DAYS = { Daily: 1, Weekly: 7, Biweekly: 14, Monthly: 30 };

export function buildStarterChores(profile) {
    const { bedrooms = 1, bathrooms = 1, laundryType = 'In-unit', cleaningStyle = 'Weekly sweep' } = profile;
    const bedroomCount = Math.min(Math.max(parseInt(bedrooms) || 1, 0), 4);
    const bathroomCount = Math.min(Math.max(parseInt(bathrooms) || 1, 0), 3);

    function freq(base) {
        if (cleaningStyle === 'Pretty on top of it') return base;
        return base === 'Daily' ? 'Weekly' : base;
    }

    const chores = [];
    chores.push({ name: 'Vacuum',        frequency: freq('Weekly'),   room: null });
    chores.push({ name: 'Mop floors',    frequency: freq('Biweekly'), room: null });
    chores.push({ name: 'Dust surfaces', frequency: freq('Biweekly'), room: null });

    if (bedroomCount === 1) {
        chores.push({ name: 'Change bed sheets', frequency: freq('Biweekly'), room: 'Bedroom' });
    } else {
        for (let i = 1; i <= bedroomCount; i++)
            chores.push({ name: `Bedroom ${i} sheets`, frequency: freq('Biweekly'), room: 'Bedroom' });
    }

    if (bathroomCount === 1) {
        chores.push({ name: 'Wipe bathroom sink', frequency: freq('Weekly'),   room: 'Bathroom' });
        chores.push({ name: 'Scrub toilet',       frequency: freq('Weekly'),   room: 'Bathroom' });
        chores.push({ name: 'Clean shower',       frequency: freq('Biweekly'), room: 'Bathroom' });
    } else {
        for (let i = 1; i <= bathroomCount; i++) {
            chores.push({ name: `Bathroom ${i} sink`,   frequency: freq('Weekly'),   room: 'Bathroom' });
            chores.push({ name: `Bathroom ${i} toilet`, frequency: freq('Weekly'),   room: 'Bathroom' });
            chores.push({ name: `Bathroom ${i} shower`, frequency: freq('Biweekly'), room: 'Bathroom' });
        }
    }

    chores.push({ name: 'Wipe kitchen counters', frequency: freq('Daily'),  room: 'Kitchen' });
    chores.push({ name: 'Clean stovetop',        frequency: freq('Weekly'), room: 'Kitchen' });
    chores.push({ name: 'Take out trash',        frequency: freq('Weekly'), room: 'Kitchen' });
    chores.push({ name: 'Wash dishes',           frequency: freq('Daily'),  room: 'Kitchen' });

    if (laundryType !== 'Laundromat')
        chores.push({ name: 'Do laundry', frequency: freq('Weekly'), room: 'Laundry Room' });

    return chores;
}

export function daysUntilDue(chore) {
    if (chore.frequency === 'As needed') return Infinity;
    const rawAnchor = chore.lastDone ?? chore.createdAt;
    if (!rawAnchor) return -1;
    const last = rawAnchor.toDate?.() ?? new Date(rawAnchor);
    const next = new Date(last.getTime() + (FREQ_DAYS[chore.frequency] ?? 7) * 86400000);
    return Math.floor((next - new Date()) / 86400000);
}

export function dueLabel(days) {
    if (days === Infinity) return 'No schedule';
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
}

export function choreStatus(chore) {
    const days = daysUntilDue(chore);
    if (days === Infinity) return null;
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    return 'upcoming';
}
