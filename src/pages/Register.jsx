import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { API } from '../api';
import { friendlyAuthError } from '../utils/errors';

export default function Register() {
    const navigate = useNavigate();
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    // Redirect handled by GuestRoute in App.jsx

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

        setLoading(true);
        try {
            await API.register(name, email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(friendlyAuthError(err.code));
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
                    <p className="auth-tagline">Let&apos;s get your home sorted 🌿</p>
                    <h2>Create your account</h2>

                    {error && <div className="auth-alert error">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="name">Your name</label>
                            <input
                                id="name" type="text" placeholder="Anna"
                                autoComplete="given-name" value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
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
                                id="password" type="password" placeholder="At least 8 characters"
                                autoComplete="new-password" value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
