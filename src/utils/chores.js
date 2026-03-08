export const FREQ_DAYS = { Daily: 1, Weekly: 7, Biweekly: 14, Monthly: 30 };

export function daysUntilDue(chore) {
    if (!chore.lastDone) return -1;
    const last = chore.lastDone.toDate?.() ?? new Date(chore.lastDone);
    const next = new Date(last.getTime() + (FREQ_DAYS[chore.frequency] ?? 7) * 86400000);
    return Math.floor((next - new Date()) / 86400000);
}

export function dueLabel(days) {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
}

export function choreStatus(chore) {
    const days = daysUntilDue(chore);
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    return 'upcoming';
}
