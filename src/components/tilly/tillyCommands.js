import { ROOM_RULES } from './tillyData';

export function guessRoom(choreName) {
    const lower = choreName.toLowerCase();
    for (const { room, keywords } of ROOM_RULES) {
        if (keywords.some(k => lower.includes(k))) return room;
    }
    return null;
}

export function isRoomRequest(text) {
    return /room/i.test(text) && /assign|apply|add|organiz|set|suggest|auto|sort|group|figure/i.test(text);
}

export function isAutoScheduleRequest(text) {
    return /put (those|them|my chores|these).*(plan|schedule|calendar)|schedule (them|those|all|my chores|everything)|add (them|those).*(plan|schedule)|^(plan|schedule) (those|them|all|everything)$/i.test(text);
}

export function isScheduleRequest(text) {
    return /morning|afternoon|evening/i.test(text) &&
        /schedule|put|move|add|set|plan|remind|shift/i.test(text);
}

export function isUnscheduleRequest(text) {
    return /unschedule|remove from schedule|clear.*schedule|take.*off.*schedule/i.test(text);
}

export function parseTime(text) {
    if (/morning/i.test(text))   return 'morning';
    if (/afternoon/i.test(text)) return 'afternoon';
    if (/evening/i.test(text))   return 'evening';
    return null;
}

export function findChore(chores, text) {
    const lower = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const c of chores) {
        const words = c.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const score = words.filter(w => lower.includes(w)).length;
        if (score > bestScore) { best = c; bestScore = score; }
    }
    return bestScore > 0 ? best : null;
}
