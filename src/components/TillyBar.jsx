import { useState, useRef, useEffect } from 'react';

const STUBS = [
    { match: /stain/i,    reply: "For most fabric stains, blot (don't rub!) with cold water first. For tough stains like red wine, try club soda or a mix of dish soap and hydrogen peroxide." },
    { match: /bathroom/i, reply: "A good bathroom routine: wipe down the sink daily, scrub the toilet weekly, and deep clean the shower every 2 weeks. Keeping a squeegee in the shower helps a lot!" },
    { match: /kitchen/i,  reply: "Wipe counters after every use, sweep or Swiffer daily, and deep clean the stovetop weekly. The inside of the microwave gets gross fast — cover your food!" },
    { match: /routine/i,  reply: "Try a '10-minute daily reset': put things away, wipe surfaces, do a quick sweep. Weekly: bathrooms and floors. Monthly: deep clean one area at a time." },
    { match: /smell/i,    reply: "For mystery smells: check drains (baking soda + vinegar flush), trash cans (wash & dry them), and the fridge. Activated charcoal bags work great for closets." },
    { match: /mold/i,     reply: "For small mold spots, white vinegar in a spray bottle works well — spray, wait an hour, wipe. For larger areas or anything on drywall, it's worth calling a pro." },
];

const FALLBACK = "Great question! I'm still learning more tips every day. In the meantime, your Tidy chore list is a great place to start — consistent small steps make the biggest difference. 🌿";

function stubReply(text) {
    for (const { match, reply } of STUBS) {
        if (match.test(text)) return reply;
    }
    return FALLBACK;
}

export default function TillyBar() {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'tilly', text: "Hi! I'm Tilly 🌿 Ask me anything about cleaning, stains, routines, or keeping your space fresh." }
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    function send() {
        const text = input.trim();
        if (!text) return;
        const updated = [...messages, { from: 'user', text }];
        setMessages(updated);
        setInput('');
        setOpen(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { from: 'tilly', text: stubReply(text) }]);
        }, 600);
    }

    function handleKey(e) {
        if (e.key === 'Enter') send();
    }

    return (
        <div className="tilly-bar">
            <div className="tilly-input-row">
                <span className="tilly-leaf">🌿</span>
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
                            {m.text}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}
