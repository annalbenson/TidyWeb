import { API } from '../../api';
import { buildStarterChores } from '../../utils/chores';
import { guessRoom, parseTime, findChore } from './tillyCommands';
import { QUICK_TASKS } from './tillyData';

export async function handleRoomAssignment(ctx) {
    const { uid, householdId, addTilly, setOpen } = ctx;
    setOpen(true);
    setTimeout(() => addTilly("On it! Let me look at your chores…"), 400);

    let chores;
    try {
        chores = await API.getChores(uid, householdId);
    } catch {
        setTimeout(() => addTilly("Hmm, I couldn't load your chores right now. Try again in a moment."), 800);
        return;
    }

    const unroomed = chores.filter(c => !c.room);
    if (unroomed.length === 0) {
        setTimeout(() => addTilly("All your chores already have rooms assigned — nothing to do! 🌿"), 800);
        return;
    }

    const assigned = [];
    const skipped = [];

    for (const chore of unroomed) {
        const room = guessRoom(chore.name);
        if (room) assigned.push({ chore, room });
        else skipped.push(chore.name);
    }

    if (assigned.length === 0) {
        setTimeout(() => addTilly(`I looked at your ${unroomed.length} unassigned chores but couldn't confidently place any of them — names like "Vacuum" or "Mop floors" can apply to any room. Edit those manually from the Chores page!`), 800);
        return;
    }

    await Promise.allSettled(
        assigned.map(({ chore, room }) => API.updateChore(uid, chore.id, { room }, householdId))
    );

    window.dispatchEvent(new CustomEvent('tilly:chores-updated'));

    const lines = assigned.map(({ chore, room }) => `• ${chore.name} → ${room}`).join('\n');
    const skipNote = skipped.length > 0
        ? `\n\nI left ${skipped.length} alone since I wasn't sure (${skipped.join(', ')}) — set those manually.`
        : '';

    setTimeout(() => addTilly(`Done! I assigned rooms to ${assigned.length} chore${assigned.length !== 1 ? 's' : ''}:\n${lines}${skipNote}`), 900);
}

export async function handleScheduleChore(ctx, text) {
    const { uid, householdId, addTilly } = ctx;
    const time = parseTime(text);
    if (!time) {
        addTilly("I'd be happy to schedule that! Just tell me which time — Morning, Afternoon, or Evening?");
        return;
    }

    let chores;
    try {
        chores = await API.getChores(uid, householdId);
    } catch {
        addTilly("I couldn't load your chores right now — try again in a moment.");
        return;
    }

    const chore = findChore(chores, text);
    if (!chore) {
        addTilly("I couldn't figure out which chore you meant. Try something like \"put Dishes in the evening\" or \"schedule Laundry for morning\".");
        return;
    }

    try {
        await API.scheduleChore(uid, chore.id, { scheduledDate: 'daily', scheduledTime: time }, householdId);
        window.dispatchEvent(new CustomEvent('tilly:chores-updated'));
        const label = chore.frequency === 'Daily' ? 'every day' : 'this week';
        addTilly(`Done! "${chore.name}" is scheduled for ${time} ${label}. Check the Weekly Plan to see it. 🌿`);
    } catch {
        addTilly("Something went wrong saving that — want to try again?");
    }
}

export async function handleUnscheduleChore(ctx, text) {
    const { uid, householdId, addTilly } = ctx;
    let chores;
    try {
        chores = await API.getChores(uid, householdId);
    } catch {
        addTilly("I couldn't load your chores right now — try again in a moment.");
        return;
    }

    const chore = findChore(chores, text);
    if (!chore) {
        addTilly("I couldn't figure out which chore you meant — can you be more specific?");
        return;
    }

    try {
        await API.unscheduleChore(uid, chore.id, householdId);
        window.dispatchEvent(new CustomEvent('tilly:chores-updated'));
        addTilly(`Got it — "${chore.name}" has been removed from the schedule and will show back up in the unscheduled strip. 🌿`);
    } catch {
        addTilly("Something went wrong — want to try again?");
    }
}

export async function handleQuickTask(ctx) {
    const task = QUICK_TASKS[Math.floor(Math.random() * QUICK_TASKS.length)];
    ctx.addTilly(`Here's a great 5-minute task:\n\n✅ ${task}\n\nSmall wins add up. Want another one?`);
}

export async function handleDailyPlan(ctx) {
    const { uid, addTilly } = ctx;
    addTilly("On it…");
    let profile;
    try {
        profile = await API.getProfile(uid);
    } catch {
        addTilly("I couldn't load your profile right now — try again in a moment.");
        return;
    }

    const style = profile?.cleaningStyle ?? '';
    let plan;
    if (/pretty on top|weekly sweep/i.test(style)) {
        plan = "Here's a solid plan for today:\n\n• Wash any dishes in the sink\n• Vacuum the main living area\n• Quick bathroom wipe-down (sink + toilet)\n• Check laundry — start a load if needed\n\nYou've got this! 🌿";
    } else if (/as.?needed|honestly.*chaos/i.test(style)) {
        plan = "Let's keep it manageable today:\n\n• Wipe down counters and surfaces\n• Quick bathroom wipe-down\n• Vacuum one room\n\nThree tasks, big impact. 🌿";
    } else {
        plan = "Here's a solid plan for today:\n\n• Wash any dishes in the sink\n• Vacuum the main living area\n• Quick bathroom wipe-down (sink + toilet)\n• Check laundry — start a load if needed\n\nYou've got this! 🌿";
    }
    addTilly(plan);
}

export async function handleReonboard(ctx) {
    const { uid, householdId, createdBy, addTilly, setPendingConfirm } = ctx;
    if (householdId && createdBy && createdBy !== uid) {
        addTilly("Since you're in a shared household, only the person who created it can reset everything. Ask them to say \"start over\" or \"we moved\" here. 🌿");
        return;
    }
    addTilly("This will delete all your chores and profile and restart setup. Reply **yes** to confirm, or anything else to cancel.");
    setPendingConfirm('reonboard');
}

export async function confirmReonboard(ctx) {
    const { uid, householdId, addTilly, navigate } = ctx;
    addTilly("Clearing everything…");
    try {
        const [chores, rooms] = await Promise.all([
            API.getChores(uid, householdId),
            API.getRooms(uid),
        ]);
        await Promise.allSettled([
            ...chores.map(c => API.deleteChore(uid, c.id, householdId)),
            ...rooms.map(r => API.deleteRoom(uid, r.id)),
        ]);
        await API.deleteProfile(uid);
    } catch {
        addTilly("Something went wrong — please try again.");
        return;
    }
    navigate('/onboarding');
}

export async function handleAddStarterChores(ctx) {
    const { uid, householdId, addTilly } = ctx;
    addTilly("On it — pulling your starter list from your profile… 🌿");
    let profile;
    try {
        profile = await API.getProfile(uid) ?? {};
    } catch {
        addTilly("I couldn't load your profile right now — try again in a moment.");
        return;
    }
    const { chores, rooms } = buildStarterChores(profile);
    await Promise.allSettled([
        ...chores.map(c => API.addChore(uid, c, householdId)),
        ...rooms.map(r => API.addRoom(uid, r)),
    ]);
    window.dispatchEvent(new CustomEvent('tilly:chores-updated'));
    const roomNote = rooms.length > 0 ? ` and created ${rooms.length} named room${rooms.length !== 1 ? 's' : ''} in your Rooms tab` : '';
    addTilly(`Done! I added ${chores.length} starter chores${roomNote} based on your home profile. Head to Chores to see them. 🌿`);
}

export async function handleAutoSchedule(ctx) {
    const { uid, householdId, addTilly } = ctx;
    addTilly("On it — let me spread those across the week… 🌿");
    let chores;
    try {
        chores = await API.getChores(uid, householdId);
    } catch {
        addTilly("I couldn't load your chores right now — try again in a moment.");
        return;
    }

    const unscheduled = chores.filter(c => !c.scheduledDate && c.frequency !== 'As needed');
    if (unscheduled.length === 0) {
        addTilly("All your chores are already on the plan! Head to the Plan tab to see them. 🌿");
        return;
    }

    const slots = ['morning', 'afternoon', 'evening'];
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    const dailyChores = unscheduled.filter(c => c.frequency === 'Daily');
    const otherChores = unscheduled.filter(c => c.frequency !== 'Daily');

    const ops = [];
    let slotIdx = 0;

    for (const c of dailyChores) {
        ops.push(API.scheduleChore(uid, c.id, { scheduledDate: 'daily', scheduledTime: slots[slotIdx % 3] }, householdId));
        slotIdx++;
    }

    let dayIdx = 0;
    for (const c of otherChores) {
        ops.push(API.scheduleChore(uid, c.id, { scheduledDate: days[dayIdx % 7], scheduledTime: slots[slotIdx % 3] }, householdId));
        slotIdx++;
        if (slotIdx % 3 === 0) dayIdx++;
    }

    await Promise.allSettled(ops);
    window.dispatchEvent(new CustomEvent('tilly:chores-updated'));
    addTilly(`Done! I scheduled ${unscheduled.length} chore${unscheduled.length !== 1 ? 's' : ''} across the week. Check the Plan tab to see them! 🌿`);
}
