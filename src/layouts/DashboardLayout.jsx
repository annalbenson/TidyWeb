import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API } from '../api';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import TillyBar from '../components/TillyBar';

const BOTTOM_NAV = [
    { to: '/dashboard/chores',  icon: '✅', label: 'Chores'  },
    { to: '/dashboard/rooms',   icon: '🏠', label: 'Rooms'   },
    { to: '/dashboard/plan',    icon: '📋', label: 'Plan'    },
    { to: '/dashboard/profile', icon: '🪴', label: 'Profile' },
];

export default function DashboardLayout() {
    const user = useAuth();
    const navigate = useNavigate();
    const uid = user?.uid;
    const [ready, setReady] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (!uid) return;
        API.getProfile(uid)
            .then(p => {
                if (!p) navigate('/onboarding', { replace: true });
                else setReady(true);
            })
            .catch(() => setLoadError(true));
    }, [uid]);

    async function handleLogout() {
        await API.logout();
        navigate('/');
    }

    if (loadError) return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: 16 }}>Something went wrong loading your profile.</p>
                <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Retry</button>
            </div>
        </div>
    );

    if (!ready) return null;

    return (
        <>
            <Nav showAuth={false} />
            <div className="dashboard-shell">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="dashboard-body">
                    <TillyBar />
                    <main className="dashboard-content">
                        <Outlet />
                    </main>
                </div>
            </div>
            <nav className="bottom-nav">
                {BOTTOM_NAV.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}
                    >
                        <span className="bottom-nav-icon">{icon}</span>
                        <span className="bottom-nav-label">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
