import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

function BrowserMockup() {
    return (
        <div className="hero-browser">
            <div className="browser-chrome">
                <div className="browser-dots">
                    <span className="browser-dot red" />
                    <span className="browser-dot yellow" />
                    <span className="browser-dot green" />
                </div>
                <div className="browser-url">tidy.app / dashboard / plan</div>
            </div>
            <div className="browser-body">
                <div className="browser-sidebar">
                    <div className="browser-logo">🌿</div>
                    <div className="browser-nav active" title="Plan">📅</div>
                    <div className="browser-nav" title="Chores">✅</div>
                    <div className="browser-nav" title="Rooms">🏠</div>
                    <div className="browser-nav" title="Declutter">🗂️</div>
                </div>
                <div className="browser-main">
                    <div className="browser-strip">
                        <span className="browser-strip-label">THIS WEEK</span>
                        <span className="browser-chip overdue">Mop floors</span>
                        <span className="browser-chip">Vacuum</span>
                        <span className="browser-chip due-week">Dust surfaces</span>
                    </div>
                    <div className="browser-board">
                        <div className="browser-day">
                            <div className="browser-day-hdr"><b>Mon</b><span>Mar 10</span></div>
                            <div className="browser-slot">
                                <div className="browser-slot-lbl">Morning</div>
                                <div className="browser-card">Wash dishes<span>Daily</span></div>
                            </div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Afternoon</div></div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Evening</div></div>
                        </div>
                        <div className="browser-day today">
                            <div className="browser-day-hdr"><b>Tue</b><span>Mar 11</span></div>
                            <div className="browser-slot">
                                <div className="browser-slot-lbl">Morning</div>
                                <div className="browser-card overdue">Clean stovetop<span>Overdue</span></div>
                            </div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Afternoon</div></div>
                            <div className="browser-slot">
                                <div className="browser-slot-lbl">Evening</div>
                                <div className="browser-card">Change sheets<span>Biweekly</span></div>
                            </div>
                        </div>
                        <div className="browser-day">
                            <div className="browser-day-hdr"><b>Wed</b><span>Mar 12</span></div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Morning</div></div>
                            <div className="browser-slot">
                                <div className="browser-slot-lbl">Afternoon</div>
                                <div className="browser-card">Take out trash<span>Weekly</span></div>
                            </div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Evening</div></div>
                        </div>
                        <div className="browser-day">
                            <div className="browser-day-hdr"><b>Thu</b><span>Mar 13</span></div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Morning</div></div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Afternoon</div></div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Evening</div></div>
                        </div>
                        <div className="browser-day">
                            <div className="browser-day-hdr"><b>Fri</b><span>Mar 14</span></div>
                            <div className="browser-slot">
                                <div className="browser-slot-lbl">Morning</div>
                                <div className="browser-card">Clean shower<span>Biweekly</span></div>
                            </div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Afternoon</div></div>
                            <div className="browser-slot"><div className="browser-slot-lbl">Evening</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FEATURES = [
    { icon: '🌿', title: 'Tilly AI', body: 'Ask Tilly for cleaning advice, stain removal tips, or a quick task. She\'s built into every page — just type and she\'ll help you figure out what to tackle next.' },
    { icon: '✅', title: 'Chore Tracker', body: 'Add chores with a frequency — daily, weekly, biweekly, monthly — and Tidy tracks when they\'re due. Overdue items are highlighted so nothing slips through the cracks.' },
    { icon: '🏠', title: 'Room Organization', body: 'Group chores by room — kitchen, bathroom, bedroom, garage, and more. Each room card shows a live completion ring so you can see your progress at a glance.' },
    { icon: '🗓️', title: 'Weekly Plan', body: 'Schedule chores to specific days and time slots — Morning, Afternoon, or Evening. Build a weekly routine that fits your life and see the whole week laid out in one view.' },
    { icon: '🗂️', title: 'Declutter Mode', body: 'Need to clear the clutter? Pick a room and Tidy walks you through a focused 5-task session — one decision at a time, no overwhelm.' },
    { icon: '🪴', title: 'Personalized Setup', body: 'During onboarding, Tilly learns about your home — type, size, who you live with, your cleaning style — and builds a custom starter chore list tailored just for you.' },
];

const STEPS = [
    { n: 1, title: 'Create your account', body: 'Sign up and tell Tilly about your home — what kind of place, how many rooms, who you live with, and how you\'d describe your current cleaning routine.' },
    { n: 2, title: 'Get your chore list', body: 'Tilly builds a personalized starter chore list for your home. Edit it, add your own, and organize everything by room. Your list, your rules.' },
    { n: 3, title: 'Stay on top of it', body: 'Check off chores as you go, get a morning reminder when something\'s due, and ask Tilly for help anytime — cleaning tips, a quick task, or a plan for the day.' },
];

export default function Home() {
    const navigate = useNavigate();
    const cardsRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        cardsRef.current.forEach(el => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Nav />

            {/* Hero */}
            <section className="hero">
                <div className="container hero-inner">
                    <div className="hero-text">
                        <h1>Your home,<br /><em>always tidy.</em></h1>
                        <p className="hero-sub">
                            Tidy is the chore app with a brain. Track chores by room, plan your week, declutter
                            room by room, and chat with Tilly — your personal AI cleaning assistant — whenever
                            you need a hand.
                        </p>
                        <div className="hero-ctas">
                            <button className="btn btn-light" onClick={() => navigate('/register')}>
                                Get Started — It&apos;s Free
                            </button>
                            <a href="#download" className="btn btn-outline">Download the App</a>
                        </div>
                        <p className="hero-note">Free to use · Android app available</p>
                    </div>
                    <BrowserMockup />
                </div>
            </section>

            {/* Features */}
            <section className="features" id="features">
                <div className="container">
                    <h2 className="section-title">A cleaner home starts here</h2>
                    <p className="section-sub">Everything you need to stay on top of your space — without the overwhelm.</p>
                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className="feature-card fade-in"
                                ref={el => cardsRef.current[i] = el}
                            >
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works" id="how">
                <div className="container">
                    <h2 className="section-title">How it works</h2>
                    <div className="steps">
                        {STEPS.map((s, i) => (
                            <>
                                <div
                                    key={s.n}
                                    className="step fade-in"
                                    ref={el => cardsRef.current[FEATURES.length + i] = el}
                                >
                                    <div className="step-number">{s.n}</div>
                                    <h3>{s.title}</h3>
                                    <p>{s.body}</p>
                                </div>
                                {i < STEPS.length - 1 && <div key={`div-${i}`} className="step-divider" />}
                            </>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-banner" id="download">
                <div className="container">
                    <h2>Ready for a tidier home?</h2>
                    <p>Free to use. No subscription. Just a cleaner space.</p>
                    <div className="hero-ctas">
                        <button className="btn btn-light" onClick={() => navigate('/register')}>
                            Create Your Account
                        </button>
                        <a href="#" className="btn btn-outline">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zm-2.5-1C2.67 17 2 17.67 2 18.5v5c0 .83.67 1.5 1.5 1.5S5 24.33 5 23.5v-5C5 17.67 4.33 17 3.5 17zm17 0c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5zm-4.97-15l1.04-1.04a.5.5 0 0 0-.71-.71L14.5 1.62a6.01 6.01 0 0 0-5 0L8.14.25a.5.5 0 0 0-.71.71L8.47 2C6.47 3.09 5.09 5.2 5 7.66h14c-.09-2.46-1.47-4.57-3.47-5.66zM10 6H9V5h1v1zm5 0h-1V5h1v1z" />
                            </svg>
                            Download for Android
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
