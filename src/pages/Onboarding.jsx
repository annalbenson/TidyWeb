import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API } from '../api';
import { buildStarterChores } from '../utils/chores';

const STEPS = [
    {
        id: 'homeType',
        prompt: (name) => `Hi ${name}! I'm Tilly 🌿 Let's set up your home so I can build you the perfect chore list. What kind of place do you live in?`,
        type: 'chips',
        options: ['Apartment', 'House', 'Condo', 'Studio', 'Townhouse', 'Duplex'],
        multi: false,
    },
    {
        id: 'bedrooms',
        prompt: () => "How many bedrooms does it have?",
        type: 'chips',
        options: ['1', '2', '3', '4', '5+'],
        multi: false,
        transform: v => v === '5+' ? 5 : parseInt(v),
    },
    {
        id: 'bathrooms',
        prompt: () => "And bathrooms?",
        type: 'chips',
        options: ['1', '2', '3', '4+'],
        multi: false,
        transform: v => v === '4+' ? 4 : parseInt(v),
    },
    {
        id: 'laundryType',
        prompt: () => "Do you have laundry at home, or do you use a laundromat?",
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
        prompt: () => "Any cleaning sore spots? Pick up to 3.",
        type: 'chips',
        options: [
            "Dishes piling up",
            "Bathroom scrubbing",
            "Vacuuming regularly",
            "Folding laundry",
            "Decluttering",
            "Cleaning the stovetop",
            "Mopping floors",
            "Dusting shelves",
            "Cleaning the fridge",
            "Changing bed sheets",
            "Scrubbing the toilet",
            "Taking out trash",
            "Cleaning windows & mirrors",
            "Pet hair everywhere",
            "Wiping down surfaces",
        ],
        multi: true,
        maxSelect: 3,
    },
];

export default function Onboarding() {
    const user = useAuth();
    const navigate = useNavigate();
    const uid = user?.uid;
    const firstName = user?.displayName?.split(' ')[0] ?? 'there';

    const [messages, setMessages] = useState([]);
    const [step, setStep] = useState(-1);
    const [profile, setProfile] = useState({});
    const [chipSelected, setChipSelected] = useState([]);
    const [typing, setTyping] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const bottomRef = useRef(null);
    const startedRef = useRef(false);

    useEffect(() => {
        if (!uid || startedRef.current) return;
        startedRef.current = true;
        API.getProfile(uid).then(p => {
            if (p) {
                navigate('/dashboard/plan', { replace: true });
            } else {
                postTilly(STEPS[0].prompt(firstName), 800);
                setStep(0);
            }
        });
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
        try {
            await API.saveProfile(uid, finalProfile);
        } catch {
            postTilly("Oops — something went wrong saving your profile. Please try again.", 400);
            setFinishing(false);
            return;
        }
        const { chores, rooms } = buildStarterChores(finalProfile);
        await Promise.allSettled([
            ...chores.map(c => API.addChore(uid, c)),
            ...rooms.map(r => API.addRoom(uid, r)),
        ]);
        navigate('/dashboard/plan', { replace: true });
    }

    function toggleChip(opt) {
        const def = STEPS[step];
        if (!def.multi) {
            const value = def.transform ? def.transform(opt) : opt;
            advance(opt, { [def.id]: value });
            return;
        }
        setChipSelected(prev => {
            if (prev.includes(opt)) return prev.filter(x => x !== opt);
            if (def.maxSelect && prev.length >= def.maxSelect) return prev;
            return [...prev, opt];
        });
    }

    function confirmChips() {
        const def = STEPS[step];
        const selected = chipSelected.join(', ');
        advance(selected, { [def.id]: selected });
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
                    <div className="ob-chips-area">
                        {currentStep.maxSelect && (
                            <p className="ob-chips-hint">
                                {chipSelected.length}/{currentStep.maxSelect} selected
                            </p>
                        )}
                        <div className="ob-chips">
                            {currentStep.options.map(opt => {
                                const selected = chipSelected.includes(opt);
                                const maxed = currentStep.maxSelect && chipSelected.length >= currentStep.maxSelect && !selected;
                                return (
                                    <button
                                        key={opt}
                                        className={'ob-chip' + (selected ? ' selected' : '') + (maxed ? ' maxed' : '')}
                                        onClick={() => toggleChip(opt)}
                                        disabled={maxed}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {currentStep.multi && chipSelected.length > 0 && (
                            <button className="btn btn-primary btn-sm ob-done-btn" onClick={confirmChips}>
                                Done
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
