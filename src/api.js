// ── Tidy API Client ─────────────────────────────────────────────────────────
// Handles all communication with the shared Tidy backend.
// BASE_URL: replace with the real deployed URL when the backend is live.
// ────────────────────────────────────────────────────────────────────────────

const BASE_URL  = 'https://api.tidyapp.io'; // TODO: replace with real backend URL
const TOKEN_KEY = 'tidy_token';
const USER_KEY  = 'tidy_user';

function getToken() { return localStorage.getItem(TOKEN_KEY); }

function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error (${res.status})`);
    }
    if (res.status === 204) return null;
    return res.json();
}

export const API = {
    /** Register a new account. POST /auth/register → { token, user } */
    async register(name, email, password) {
        const data = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        saveSession(data.token, data.user);
        return data;
    },

    /** Log in to an existing account. POST /auth/login → { token, user } */
    async login(email, password) {
        const data = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        saveSession(data.token, data.user);
        return data;
    },

    /** Clear session and redirect to login. */
    logout() {
        clearSession();
    },

    /** Returns the stored user object, or null. */
    getUser() {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    /** Returns true if a session token is present. */
    isLoggedIn() {
        return !!getToken();
    },

    // ── Future endpoints (stubbed for reference) ──────────────────────────

    /** GET /chores → Chore[] */
    async getChores() { return request('/chores'); },

    /** POST /chores/:id/complete → Chore */
    async completeChore(choreId) { return request(`/chores/${choreId}/complete`, { method: 'POST' }); },

    /** GET /profile → HomeProfile */
    async getProfile() { return request('/profile'); },

    /** PUT /profile → HomeProfile */
    async saveProfile(profile) {
        return request('/profile', { method: 'PUT', body: JSON.stringify(profile) });
    },
};
