import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { amazonUrl, getProductsForQuery } from '../data/products';
import { askTilly } from '../tillyAI';
import { STUBS, FALLBACK, FOLLOW_UP } from './tilly/tillyData';
import { isRoomRequest, isAutoScheduleRequest, isScheduleRequest, isUnscheduleRequest } from './tilly/tillyCommands';
import {
    handleRoomAssignment, handleScheduleChore, handleUnscheduleChore,
    handleQuickTask, handleDailyPlan, handleReonboard, confirmReonboard,
    handleAddStarterChores, handleAutoSchedule,
} from './tilly/tillyHandlers';
import { API } from '../api';

export default function TillyBar() {
    const user = useAuth();
    const uid = user?.uid;
    const { householdId, members, createdBy } = useHousehold();
    const navigate = useNavigate();

    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'tilly', text: "Hi! I'm Tilly 🌿 Ask me anything about cleaning, or type \"help\" to see what I can do." }
    ]);
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    function addTilly(text, products = null) {
        setMessages(prev => [...prev, { from: 'tilly', text, ...(products && { products }) }]);
    }

    const ctx = { uid, householdId, members, createdBy, addTilly, setOpen, navigate, setPendingConfirm };

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
                await confirmReonboard(ctx);
            } else {
                addTilly("No worries — nothing changed. 🌿");
            }
            return;
        }

        // ── Help ──────────────────────────────────────────────────────────
        if (/^(help|commands|what can you do|\?|--help)$/i.test(text)) {
            addTilly("Here's what I can do 🌿\n\n" +
                "🧹 **Cleaning advice** — ask about stains, bathrooms, kitchens, mold, smells, routines\n" +
                "⚡ **\"quick task\"** — get a random 5-minute chore\n" +
                "📋 **\"plan for today\"** — get a daily cleaning plan\n" +
                "🏠 **\"assign rooms\"** — auto-sort your chores into rooms\n" +
                "⏰ **\"schedule [chore] for morning/afternoon/evening\"** — add to your weekly plan\n" +
                "❌ **\"unschedule [chore]\"** — remove from the schedule\n" +
                "🛒 **\"recommend a product for…\"** — product suggestions\n" +
                "🗑️ **\"declutter\"** — jump into declutter mode\n" +
                "📦 **\"add starter chores\"** — seed chores from your profile\n" +
                "🏡 **\"my home\" / \"my account\"** — see your home profile info\n" +
                "👥 **\"my household\"** — see who's in your household\n" +
                "🚚 **\"I moved\" / \"start over\"** — reset and re-onboard\n\n" +
                "Or just ask me anything about cleaning — I'm happy to help!");
            return;
        }

        // ── Account / home profile info ──────────────────────────────────
        if (/my (home|house|place|profile|account|info)|how many (bed|bath|room)|what('s| is) my/i.test(text)) {
            let profile;
            try {
                profile = await API.getProfile(uid);
            } catch { /* fall through */ }
            if (!profile) {
                addTilly("I don't have your home profile yet. Head to onboarding to set it up, or say \"start over\" to redo it. 🌿");
            } else {
                const lines = [];
                if (profile.homeType)          lines.push(`🏠 Home type: ${profile.homeType}`);
                if (profile.bedrooms)          lines.push(`🛏️ Bedrooms: ${profile.bedrooms}`);
                if (profile.bathrooms)         lines.push(`🚿 Bathrooms: ${profile.bathrooms}`);
                if (profile.laundryType)       lines.push(`👕 Laundry: ${profile.laundryType}`);
                if (profile.householdMembers)  lines.push(`👥 Living with: ${profile.householdMembers}`);
                if (profile.cleaningStyle)     lines.push(`✨ Cleaning style: ${profile.cleaningStyle}`);
                if (profile.painPoints)        lines.push(`😬 Sore spots: ${profile.painPoints}`);
                addTilly("Here's what I have on file for your home:\n\n" + lines.join('\n'));
            }
            return;
        }

        // ── Household info ───────────────────────────────────────────────
        if (/my household|who('s| is) in my|household members|my family|my roommate/i.test(text)) {
            if (!householdId) {
                addTilly("You're not in a shared household right now. You can create or join one from the Household page in settings. 🌿");
            } else {
                const names = Object.values(members).map(m => m.name).filter(Boolean);
                if (names.length === 0) {
                    addTilly("You're in a household, but I couldn't load the member list right now. Try again in a moment.");
                } else if (names.length === 1) {
                    addTilly(`You're in a household, but it's just you (${names[0]}) right now. Share your join code from the Household page to invite others! 🌿`);
                } else {
                    addTilly(`Your household has ${names.length} members:\n\n${names.map(n => `• ${n}`).join('\n')}\n\n🌿`);
                }
            }
            return;
        }

        if (uid && isRoomRequest(text))       { await handleRoomAssignment(ctx); return; }
        if (uid && isUnscheduleRequest(text))  { addTilly("On it…"); await handleUnscheduleChore(ctx, text); return; }
        if (uid && isScheduleRequest(text))    { addTilly("On it…"); await handleScheduleChore(ctx, text); return; }

        if (/quick|5.?min|fast chore|what (can|should) i do|where (should|do) i start/i.test(text)) {
            await handleQuickTask(ctx); return;
        }

        if (/plan for today|cleaning plan|what should i (do|clean) today|today.?s? plan/i.test(text)) {
            await handleDailyPlan(ctx); return;
        }

        if (/i('ve| have)? moved|just moved|new (home|house|apartment|place)|we moved/i.test(text)) {
            if (householdId && createdBy && createdBy !== uid) {
                addTilly("Congrats on the new place! 🌿 Since you're in a shared household, only the person who created it can reset everything. Ask them to say \"we moved\" here.");
                return;
            }
            addTilly("Congrats on the new place! 🌿 I'll clear your current chores and profile so we can set everything up fresh for your new home. Reply **yes** to start over, or anything else to cancel.");
            setPendingConfirm('reonboard');
            return;
        }

        if (/start over|reset (everything|my chores)|re.?onboard/i.test(text))  { await handleReonboard(ctx); return; }

        if (uid && /\b(basic|starter|default|seed)\b.*chore|(give|add).*(some|basic|starter).*chore/i.test(text)) {
            await handleAddStarterChores(ctx); return;
        }

        if (uid && isAutoScheduleRequest(text)) { await handleAutoSchedule(ctx); return; }

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

        // Check if this is a follow-up to a previous Tilly stub response
        const lastTilly = [...messages].reverse().find(m => m.from === 'tilly');
        const isFollowUp = lastTilly && STUBS.some(s => s.reply === lastTilly.text) && FOLLOW_UP.test(text);

        // Try stubs first (but skip if the user is following up on one)
        const stub = !isFollowUp && STUBS.find(s => s.match.test(text));
        if (stub) {
            const products = getProductsForQuery(text);
            setTimeout(() => addTilly(stub.reply, products.length ? products : null), 400);
            return;
        }

        // Gemini for follow-ups, uncommon questions, and anything stubs can't handle
        addTilly("Thinking…");
        try {
            const history = messages.filter(m => m.text).map(m => ({ from: m.from, text: m.text }));
            history.push({ from: 'user', text });
            const reply = await askTilly(history);
            setMessages(prev => {
                const copy = [...prev];
                const idx = copy.findLastIndex(m => m.from === 'tilly' && m.text === 'Thinking…');
                if (idx !== -1) copy[idx] = { from: 'tilly', text: reply };
                return copy;
            });
        } catch {
            setMessages(prev => {
                const copy = [...prev];
                const idx = copy.findLastIndex(m => m.from === 'tilly' && m.text === 'Thinking…');
                if (idx !== -1) copy[idx] = { from: 'tilly', text: FALLBACK };
                return copy;
            });
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
