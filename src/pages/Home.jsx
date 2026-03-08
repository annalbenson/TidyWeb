import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

function PhoneMockup() {
    return (
        <div className="hero-phone">
            <div className="phone-shell">
                <div className="phone-screen">
                    <div className="screen-nav">Tidy</div>
                    <div className="screen-greeting">Good morning, Anna!</div>
                    <span className="screen-badge">2 overdue</span>
                    <div className="screen-chore overdue">
                        <span className="screen-check">☐</span>
                        <span className="screen-chore-text">
                            <span className="screen-chore-name">Vacuum floors</span>
                            <span className="screen-chore-freq overdue-text">Weekly · Overdue</span>
                        </span>
                    </div>
                    <div className="screen-chore">
                        <span className="screen-check">☐</span>
                        <span className="screen-chore-text">
                            <span className="screen-chore-name">Wash dishes</span>
                            <span className="screen-chore-freq">Daily · Due today</span>
                        </span>
                    </div>
                    <div className="screen-chore done">
                        <span className="screen-check">✓</span>
                        <span className="screen-chore-text">
                            <span className="screen-chore-name">Clean bathroom</span>
                            <span className="screen-chore-freq">Weekly · Done</span>
                        </span>
                    </div>
                    <div className="screen-chore done">
                        <span className="screen-check">✓</span>
                        <span className="screen-chore-text">
                            <span className="screen-chore-name">Take out trash</span>
                            <span className="screen-chore-freq">Weekly · Done</span>
                        </span>
                    </div>
                    <div className="screen-tilly-btn">Chat with Tilly 🌿</div>
                </div>
            </div>
        </div>
    );
}

const FEATURES = [
    { icon: '🌿', title: 'Tilly AI', body: 'Ask Tilly for cleaning advice, stain removal tips, a daily plan, or a quick 5-minute task. She knows your home and keeps her answers warm, practical, and to the point.' },
    { icon: '✅', title: 'Chore Tracker', body: 'Add chores with a frequency — daily, weekly, biweekly, monthly — and Tidy tracks when they\'re due. Overdue items are highlighted so nothing slips through the cracks.' },
    { icon: '🏠', title: 'Room Organization', body: 'Group chores by room — kitchen, bathroom, bedroom, garage, and more. Filter your list to focus on one space at a time instead of staring at an overwhelming wall of tasks.' },
    { icon: '🔔', title: 'Daily Reminders', body: 'Get a morning notification every day listing anything due today or overdue. No nagging — just one gentle nudge at 8 AM to help you stay on track.' },
    { icon: '🗂️', title: 'Declutter Mode', body: 'Tell Tilly you want to declutter and she\'ll launch a guided room-by-room session with concrete tasks — keep, donate, toss. Tackle the mess one category at a time.' },
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
                            Tidy is the chore app with a brain. Track tasks by room, get daily reminders for
                            anything overdue, and chat with Tilly — your personal AI cleaning assistant — whenever
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
                    <PhoneMockup />
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
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.42.07 2.4.83 3.23.83.84 0 2.4-1.02 4.04-.87 1.57.13 2.75.84 3.52 2.12-3.22 1.96-2.68 6.28.21 7.78zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
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
