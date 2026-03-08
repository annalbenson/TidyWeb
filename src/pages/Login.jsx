import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { API } from '../api';

function friendlyError(code) {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Incorrect email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Try again in a few minutes.';
        default:
            return 'Login failed. Please try again.';
    }
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    // Redirect handled by GuestRoute in App.jsx

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields.'); return; }

        setLoading(true);
        try {
            await API.login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Nav showAuth={false} />
            <main className="auth-page">
                <div className="auth-card">
                    <div className="auth-logo">Tidy</div>
                    <p className="auth-tagline">Welcome back 🌿</p>
                    <h2>Log in to your account</h2>

                    {error && <div className="auth-alert error">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email" type="email" placeholder="you@example.com"
                                autoComplete="email" value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password" type="password" placeholder="••••••••"
                                autoComplete="current-password" value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Logging in…' : 'Log In'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don&apos;t have an account? <Link to="/register">Sign up free</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
