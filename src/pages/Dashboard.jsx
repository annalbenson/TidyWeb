import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { useAuth } from '../AuthContext';
import { API } from '../api';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = useAuth();
    const firstName = user?.displayName?.split(' ')[0] ?? 'friend';

    async function handleLogout() {
        await API.logout();
        navigate('/', { replace: true });
    }

    return (
        <>
            <Nav loggedIn onLogout={handleLogout} />
            <main className="dashboard-page">
                <div className="dashboard-card">
                    <div className="tilly-icon">🌿</div>
                    <h2>You&apos;re in, {firstName}!</h2>
                    <p>
                        The full web dashboard is on its way. In the meantime, download the Tidy app
                        to manage your chores, chat with Tilly, and keep your home in order.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Your account is live in Firebase — it&apos;ll sync with the app once the Android
                        migration is done.
                    </p>
                    <div className="dashboard-actions">
                        <a href="#" className="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.42.07 2.4.83 3.23.83.84 0 2.4-1.02 4.04-.87 1.57.13 2.75.84 3.52 2.12-3.22 1.96-2.68 6.28.21 7.78zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Download Tidy for Android
                        </a>
                        <button className="btn btn-light" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
