import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Nav({ showAuth = true, loggedIn = false, onLogout }) {
    const navigate = useNavigate();
    const navRef = useRef(null);

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        const handleScroll = () => {
            nav.style.boxShadow = window.scrollY > 10
                ? '0 4px 24px rgba(0,0,0,0.2)'
                : '0 2px 12px rgba(0,0,0,0.12)';
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className="nav" ref={navRef}>
            <div className="nav-inner container">
                <span className="nav-logo" onClick={() => navigate('/')}>Tidy</span>
                {showAuth && (
                    <div className="nav-actions">
                        {loggedIn ? (
                            <button className="btn btn-sm" onClick={onLogout}>Log Out</button>
                        ) : (
                            <>
                                <button className="btn btn-sm" onClick={() => navigate('/login')}>Log In</button>
                                <button className="btn btn-sm btn-filled" onClick={() => navigate('/register')}>Get Started</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
