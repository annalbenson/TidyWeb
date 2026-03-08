import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API } from '../api';

const STEPS = [
    {
        id: 'homeType',
        prompt: (name) => `Hi ${name}! I'm Tilly 🌿 Let's set up your home so I can build you the perfect chore list. What kind of place do you live in — apartment, house, condo?`,
        type: 'text',
    },
    {
        id: 'bedrooms',
        prompt: () => "Got it! How many bedrooms does it have?",
        type: 'text',
    },
    {
        id: 'bathrooms',
        prompt: () => "And bathrooms?",
        type: 'text',
    },
    {
        id: 'laundryType',
        prompt: () => "Do you have laundry at home, or do you use a shared machine or laundromat?",
        type: 'chips',
        options: ["In-unit", "Shared in building", "Laundromat"],
        multi: false,
    },
    {
        id: 'householdMembers',
        prompt: () => "Who shares the space with you? Pick all that apply.",
        type: 'chips',
        options: ["Just me", "Partner", "Kids", "Roommates", "Pets"],
        multi: true,
    },
    {
        id: 'cleaningStyle',
        prompt: () => "How would you describe your current cleaning routine?",
        type: 'chips',
        options: ["Pretty on top of it", "Weekly sweep", "As-needed", "Honestly… it's chaos"],
        multi: false,
    },
    {
        id: 'painPoints',
        prompt: () => "Last one! Any cleaning sore spots? Things that pile up, areas you dread, or chores that always get skipped?",
        type: 'text',
    },
];

const DEFAULT_CHORES = [
    { name: 'Vacuum', frequency: 'Weekly' },
    { name: 'Mop floors', frequency: 'Biweekly' },
    { name: 'Dust surfaces', frequency: 'Biweekly' },
    { name: 'Change bed sheets', frequency: 'Biweekly' },
    { name: 'Wipe bathroom sink', frequency: 'Weekly' },
    { name: 'Scrub toilet', frequency: 'Weekly' },
    { name: 'Clean shower', frequency: 'Biweekly' },
    { name: 'Wipe kitchen counters', frequency: 'Daily' },
    { name: 'Clean stovetop', frequency: 'Weekly' },
    { name: 'Take out trash', frequency: 'Weekly' },
    { name: 'Do laundry', frequency: 'Weekly' },
    { name: 'Wash dishes', frequency: 'Daily' },
];

function extractHomeType(text) {
    const t = text.toLowerCase();
    if (t.includes('apartment') || t.includes('apt')) return 'Apartment';
    if (t.includes('townhouse') || t.includes('townhome')) return 'Townhouse';
    if (t.includes('condo')) return 'Condo';
    if (t.includes('studio')) return 'Studio';
    if (t.includes('house')) return 'House';
    if (t.includes('duplex')) return 'Duplex';
    const s = text.trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseNumber(text, fallback = 1) {
    const words = { one: 1, a: 1, two: 2, couple: 2, three: 3, four: 4, five: 5, six: 6 };
    const lower = text.toLowerCase();
    for (const [word, num] of Object.entries(words)) {
        if (lower.includes(word)) return num;
    }
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : fallback;
}

export default function Onboarding() {
    const user = useAuth();
    const navigate = useNavigate();
    const uid = user?.uid;
    const firstName = user?.displayName?.split(' ')[0] ?? 'there';

    const [messages, setMessages] = useState([]);
    const [step, setStep] = useState(-1);
    const [profile, setProfile] = useState({});
    const [input, setInput] = useState('');
    const [chipSelected, setChipSelected] = useState([]);
    const [typing, setTyping] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const bottomRef = useRef(null);

    // Redirect if profile already exists
    useEffect(() => {
        if (!uid) return;
        API.getProfile(uid).then(p => {
            if (p) navigate('/dashboard/chores', { replace: true });
        });
    }, [uid]);

    // Kick off the chat
    useEffect(() => {
        if (!uid) return;
        postTilly(STEPS[0].prompt(firstName), 800);
        setStep(0);
    }, [uid]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    function postTilly(text, delay = 600) {
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, { from: 'tilly', text }]);
        }, delay);
    }

    function advance(userText, profileUpdate) {
        setMessages(prev => [...prev, { from: 'user', text: userText }]);
        setInput('');
        setChipSelected([]);

        const newProfile = { ...profile, ...profileUpdate };
        setProfile(newProfile);

        const nextStep = step + 1;
        if (nextStep < STEPS.length) {
            setStep(nextStep);
            postTilly(STEPS[nextStep].prompt());
        } else {
            setStep(STEPS.length);
            setFinishing(true);
            postTilly("Perfect — I've got everything I need! Give me just a moment while I put together a chore list for your home… 🌿");
            setTimeout(() => saveAndNavigate(newProfile), 2000);
        }
    }

    async function saveAndNavigate(finalProfile) {
        await API.saveProfile(uid, finalProfile);
        for (const chore of DEFAULT_CHORES) {
            await API.addChore(uid, chore);
        }
        navigate('/dashboard/chores', { replace: true });
    }

    function handleTextSubmit() {
        const text = input.trim();
        if (!text || finishing || typing) return;

        const id = STEPS[step]?.id;
        let profileUpdate = {};
        if (id === 'homeType') profileUpdate = { homeType: extractHomeType(text) };
        else if (id === 'bedrooms') profileUpdate = { bedrooms: parseNumber(text) };
        else if (id === 'bathrooms') profileUpdate = { bathrooms: parseNumber(text) };
        else profileUpdate = { [id]: text };

        advance(text, profileUpdate);
    }

    function toggleChip(opt, multi) {
        if (!multi) {
            advance(opt, { [STEPS[step].id]: opt });
        } else {
            setChipSelected(prev =>
                prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
            );
        }
    }

    function confirmChips() {
        const selected = chipSelected.join(', ');
        advance(selected, { [STEPS[step].id]: selected });
    }

    const currentStep = step >= 0 && step < STEPS.length ? STEPS[step] : null;
    const inputActive = currentStep && !typing && !finishing;

    return (
        <div className="ob-page">
            <div className="ob-header">
                <div className="ob-avatar">🌿</div>
                <div className="ob-header-text">
                    <h2>Tilly</h2>
                    <p>Setting up your home</p>
                </div>
            </div>

            <div className="ob-messages">
                {messages.map((m, i) => (
                    <div key={i} className={`ob-bubble ${m.from}`}>{m.text}</div>
                ))}
                {typing && (
                    <div className="ob-typing">
                        <span className="ob-typing-dot" />
                        <span className="ob-typing-dot" />
                        <span className="ob-typing-dot" />
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {inputActive && (
                <div className="ob-input-area">
                    {currentStep.type === 'chips' ? (
                        <div className="ob-chips-area">
                            <div className="ob-chips">
                                {currentStep.options.map(opt => (
                                    <button
                                        key={opt}
                                        className={'ob-chip' + (chipSelected.includes(opt) ? ' selected' : '')}
                                        onClick={() => toggleChip(opt, currentStep.multi)}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {currentStep.multi && chipSelected.length > 0 && (
                                <button className="btn btn-primary btn-sm ob-done-btn" onClick={confirmChips}>
                                    Done
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="ob-input-row">
                            <input
                                className="ob-input"
                                type="text"
                                placeholder="Type your answer…"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                                autoFocus
                            />
                            <button className="btn btn-primary btn-sm" onClick={handleTextSubmit}>Send</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
