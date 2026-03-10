import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { API } from '../api';
import { buildStarterChores } from '../utils/chores';
import { amazonUrl, getProductsForQuery } from '../data/products';

// ── Stub replies ──────────────────────────────────────────────────────────────

const STUBS = [
    { match: /stain/i,    reply: "For most fabric stains, blot (don't rub!) with cold water first. For tough stains like red wine, try club soda or a mix of dish soap and hydrogen peroxide." },
    { match: /bathroom/i, reply: "A good bathroom routine: wipe down the sink daily, scrub the toilet weekly, and deep clean the shower every 2 weeks. Keeping a squeegee in the shower helps a lot!" },
    { match: /kitchen/i,  reply: "Wipe counters after every use, sweep or Swiffer daily, and deep clean the stovetop weekly. The inside of the microwave gets gross fast — cover your food!" },
    { match: /routine/i,  reply: "Try a '10-minute daily reset': put things away, wipe surfaces, do a quick sweep. Weekly: bathrooms and floors. Monthly: deep clean one area at a time." },
    { match: /smell/i,    reply: "For mystery smells: check drains (baking soda + vinegar flush), trash cans (wash & dry them), and the fridge. Activated charcoal bags work great for closets." },
    { match: /mold/i,     reply: "For small mold spots, white vinegar in a spray bottle works well — spray, wait an hour, wipe. For larger areas or anything on drywall, it's worth calling a pro." },
];

const FALLBACK = "Great question! I'm still learning more tips every day. In the meantime, your Tidy chore list is a great place to start — consistent small steps make the biggest difference. 🌿";

// ── Quick tasks ───────────────────────────────────────────────────────────────

const QUICK_TASKS = [
    "Wipe down the microwave inside and out",
    "Clean the bathroom mirror and sink",
    "Empty and wipe out the trash can",
    "Wipe down the stovetop",
    "Vacuum one room",
    "Wipe down all light switches and door handles",
    "Declutter one drawer or shelf",
    "Sweep or Swiffer the kitchen floor",
    "Wipe down the outside of the fridge",
    "Clean the bathroom toilet",
    "Fold and put away any clean laundry",
    "Wipe down the bathroom counters",
    "Take out recycling",
    "Clean the inside of the microwave",
    "Dust one room",
];

// ── Room auto-assignment ──────────────────────────────────────────────────────

const ROOM_RULES = [
    { room: 'Kitchen',      keywords: ['kitchen', 'counter', 'stovetop', 'stove', 'oven', 'microwave', 'fridge', 'refrigerator', 'dishes', 'dish'] },
    { room: 'Bathroom',     keywords: ['bathroom', 'toilet', 'shower', 'tub', 'bathtub'] },
    { room: 'Bedroom',      keywords: ['bedroom', 'bed', 'sheet', 'pillow', 'mattress'] },
    { room: 'Living Room',  keywords: ['living room', 'living', 'couch', 'sofa'] },
    { room: 'Office',       keywords: ['office', 'desk', 'workspace'] },
    { room: 'Entryway',     keywords: ['entryway', 'entrance', 'doormat', 'front door', 'mudroom'] },
    { room: 'Laundry Room', keywords: ['laundry', 'washer', 'dryer'] },
    { room: 'Garage',       keywords: ['garage', 'driveway'] },
];

function guessRoom(choreName) {
    const lower = choreName.toLowerCase();
    for (const { room, keywords } of ROOM_RULES) {
        if (keywords.some(k => lower.includes(k))) return room;
    }
    return null;
}

function isRoomRequest(text) {
    return /room/i.test(text) && /assign|apply|add|organiz|set|suggest|auto|sort|group|figure/i.test(text);
}

function isScheduleRequest(text) {
    return /morning|afternoon|evening/i.test(text) &&
        /schedule|put|move|add|set|plan|remind|shift/i.test(text);
}

function isUnscheduleRequest(text) {
    return /unschedule|remove from schedule|clear.*schedule|take.*off.*schedule/i.test(text);
}

function parseTime(text) {
    if (/morning/i.test(text))   return 'morning';
    if (/afternoon/i.test(text)) return 'afternoon';
    if (/evening/i.test(text))   return 'evening';
    return null;
}

function findChore(chores, text) {
    const lower = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const c of chores) {
        const words = c.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const score = words.filter(w => lower.includes(w)).length;
        if (score > bestScore) { best = c; bestScore = score; }
    }
    return bestScore > 0 ? best : null;
}

export default function TillyBar() {
    const user = useAuth();
    const uid = user?.uid;
    const { householdId } = useHousehold();
    const navigate = useNavigate();

    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'tilly', text: "Hi! I'm Tilly 🌿 Ask me anything about cleaning, stains, routines — or say \"assign rooms to my chores\" and I'll sort them out for you." }
    ]);
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    function addTilly(text, products = null) {
        setMessages(prev => [...prev, { from: 'tilly', text, ...(products && { products }) }]);
    }

    async function handleRoomAssignment() {
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

    async function handleScheduleChore(text) {
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

    async function handleUnscheduleChore(text) {
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

    async function handleQuickTask() {
        const task = QUICK_TASKS[Math.floor(Math.random() * QUICK_TASKS.length)];
        addTilly(`Here's a great 5-minute task:\n\n✅ ${task}\n\nSmall wins add up. Want another one?`);
    }

    async function handleDailyPlan() {
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

    async function handleReonboard() {
        addTilly("This will delete all your chores and profile and restart setup. Reply **yes** to confirm, or anything else to cancel.");
        setPendingConfirm('reonboard');
    }

    async function confirmReonboard() {
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

    async function handleAddStarterChores() {
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

    async function send() {
        const text = input.trim();
        if (!text) return;
        setMessages(prev => [...prev, { from: 'user', text }]);
        setInput('');
        setOpen(true);

        // Pending confirmation check (must come first)
        if (pendingConfirm === 'reonboard') {
            setPendingConfirm(null);
            if (text.trim().toLowerCase() === 'yes') {
                await confirmReonboard();
            } else {
                addTilly("No worries — nothing changed. 🌿");
            }
            return;
        }

        if (uid && isRoomRequest(text)) {
            await handleRoomAssignment();
            return;
        }

        if (uid && isUnscheduleRequest(text)) {
            addTilly("On it…");
            await handleUnscheduleChore(text);
            return;
        }

        if (uid && isScheduleRequest(text)) {
            addTilly("On it…");
            await handleScheduleChore(text);
            return;
        }

        if (/quick|5.?min|fast chore|what (can|should) i do|where (should|do) i start/i.test(text)) {
            await handleQuickTask();
            return;
        }

        if (/plan for today|cleaning plan|what should i (do|clean) today|today.?s? plan/i.test(text)) {
            await handleDailyPlan();
            return;
        }

        if (/i('ve| have)? moved|just moved|new (home|house|apartment|place)|we moved/i.test(text)) {
            addTilly("Congrats on the new place! 🌿 I'll clear your current chores and profile so we can set everything up fresh for your new home. Reply **yes** to start over, or anything else to cancel.");
            setPendingConfirm('reonboard');
            return;
        }

        if (/start over|reset (everything|my chores)|re.?onboard/i.test(text)) {
            await handleReonboard();
            return;
        }

        if (uid && /\b(basic|starter|default|seed)\b.*chore|(give|add).*(some|basic|starter).*chore/i.test(text)) {
            await handleAddStarterChores();
            return;
        }

        if (/declutter|clutter|clear out/i.test(text)) {
            addTilly("Starting declutter mode! 🌿");
            navigate('/dashboard/declutter');
            return;
        }

        if (/recommend|suggest|what (should i|do i) use|best (product|cleaner|spray)|what (cleaner|product|spray)|what to (use|clean with)/i.test(text)) {
            const products = getProductsForQuery(text);
            if (products.length === 0) {
                addTilly("Tell me what you're trying to clean and I'll find the right product for you!");
            } else {
                addTilly("Here's what I'd grab for that:", products);
            }
            return;
        }

        const stub = STUBS.find(s => s.match.test(text));
        if (stub) {
            const products = getProductsForQuery(text);
            setTimeout(() => addTilly(stub.reply, products.length ? products : null), 600);
        } else {
            setTimeout(() => addTilly(FALLBACK), 600);
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter') send();
    }

    return (
        <div className="tilly-bar">
            <div className="tilly-input-row">
                <img src="/tilly.png" alt="Tilly" className="tilly-avatar-sm" />
                <input
                    className="tilly-input"
                    type="text"
                    placeholder="Ask Tilly anything…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                />
                <button className="btn btn-primary btn-sm" onClick={send}>Send</button>
                {open && (
                    <button className="tilly-close" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
                )}
            </div>
            {open && (
                <div className="tilly-chat-panel">
                    {messages.map((m, i) => (
                        <div key={i} className={`tilly-message ${m.from}`}>
                            {m.from === 'tilly' && (
                                <img src="/tilly.png" alt="Tilly" className="tilly-avatar-msg" />
                            )}
                            <div className="tilly-message-body">
                                {m.text && <span style={{ whiteSpace: 'pre-line' }}>{m.text}</span>}
                                {m.products?.length > 0 && (
                                    <div className="tilly-product-cards">
                                        {m.products.map(p => (
                                            <div key={p.id} className="tilly-product-card">
                                                <span className="tilly-product-emoji">{p.emoji}</span>
                                                <div className="tilly-product-info">
                                                    <div className="tilly-product-name">{p.name}</div>
                                                    <div className="tilly-product-desc">{p.description}</div>
                                                </div>
                                                <a
                                                    href={amazonUrl(p.asin)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="amazon-buy-btn"
                                                >
                                                    Buy on<br/>Amazon
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
