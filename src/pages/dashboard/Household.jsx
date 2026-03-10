import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useHousehold } from '../../contexts/HouseholdContext';
import { API } from '../../api';
import SucculentAvatar from '../../components/SucculentAvatar';

export default function Household() {
    const user = useAuth();
    const uid = user?.uid;
    const userName = user?.displayName ?? 'Member';
    const { householdId, members, loading } = useHousehold();

    // Join form state
    const [codeInput, setCodeInput] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Manage household state
    const [householdJoinCode, setHouseholdJoinCode] = useState(null);
    const [leaveConfirm, setLeaveConfirm] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Load join code when householdId is set
    useEffect(() => {
        if (!householdId) { setHouseholdJoinCode(null); return; }
        API.getHousehold(householdId).then(h => setHouseholdJoinCode(h?.joinCode ?? ''));
    }, [householdId]);

    if (loading) return null;

    // ── No household ─────────────────────────────────────────────────────────

    async function handleCreate() {
        setCreateLoading(true);
        setCreateError('');
        try {
            await API.createHousehold(uid, userName);
        } catch (err) {
            setCreateError(err.message ?? 'Could not create household.');
        } finally {
            setCreateLoading(false);
        }
    }

    async function handleJoin(e) {
        e.preventDefault();
        const code = codeInput.trim().toUpperCase();
        if (code.length !== 6) { setJoinError('Code must be 6 characters.'); return; }
        setJoinLoading(true);
        setJoinError('');
        try {
            await API.joinHousehold(uid, userName, code);
        } catch (err) {
            setJoinError(err.message ?? 'Could not join household.');
        } finally {
            setJoinLoading(false);
        }
    }

    if (!householdId) {
        return (
            <div>
                <h2 className="page-title">Household</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 28 }}>
                    Share your chore list with a partner or roommates.
                </p>

                <div className="household-cards">
                    <div className="household-card">
                        <h3>Create a household</h3>
                        <p>Start a shared list and invite others with your join code.</p>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleCreate}
                            disabled={createLoading}
                            style={{ marginTop: 12 }}
                        >
                            {createLoading ? 'Creating…' : 'Create Household'}
                        </button>
                        {createError && <p className="household-error">{createError}</p>}
                    </div>

                    <div className="household-card">
                        <h3>Join a household</h3>
                        <p>Enter the 6-character code from whoever created the household.</p>
                        <form onSubmit={handleJoin} className="household-join-form">
                            <input
                                type="text"
                                className="household-code-input"
                                placeholder="e.g. A3KXPQ"
                                value={codeInput}
                                onChange={e => setCodeInput(e.target.value.toUpperCase())}
                                maxLength={6}
                                autoCapitalize="characters"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={joinLoading}
                            >
                                {joinLoading ? 'Joining…' : 'Join'}
                            </button>
                        </form>
                        {joinError && <p className="household-error">{joinError}</p>}
                    </div>
                </div>
            </div>
        );
    }

    // ── Has household ─────────────────────────────────────────────────────────

    async function copyCode() {
        if (!householdJoinCode) return;
        await navigator.clipboard.writeText(householdJoinCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleLeave() {
        setLeaveLoading(true);
        try {
            await API.leaveHousehold(uid, householdId);
            setLeaveConfirm(false);
        } finally {
            setLeaveLoading(false);
        }
    }

    return (
        <div>
            <h2 className="page-title">Household</h2>

            <div className="household-info-card">
                <div className="household-info-row">
                    <span className="household-label">Join code</span>
                    {householdJoinCode ? (
                        <button className="household-code-chip" onClick={copyCode} title="Copy to clipboard">
                            {householdJoinCode}
                            <span className="household-copy-hint">{copied ? '✓ Copied' : 'Copy'}</span>
                        </button>
                    ) : (
                        <span className="household-code-chip">—</span>
                    )}
                </div>
            </div>

            <div className="household-section">
                <h3 className="household-section-title">Members</h3>
                <ul className="household-member-list">
                    {Object.entries(members).map(([memberId, { name }]) => (
                        <li key={memberId} className="household-member-row">
                            <SucculentAvatar uid={memberId} size={32} />
                            <span className="household-member-name">{name}</span>
                            {memberId === uid && <span className="household-you-badge">you</span>}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="household-leave-section">
                {!leaveConfirm ? (
                    <button className="btn btn-sm household-leave-btn" onClick={() => setLeaveConfirm(true)}>
                        Leave Household
                    </button>
                ) : (
                    <div className="household-leave-confirm">
                        <p>Are you sure? Your chores will revert to your personal list.</p>
                        <div className="household-leave-actions">
                            <button className="btn btn-sm" onClick={() => setLeaveConfirm(false)}>Cancel</button>
                            <button
                                className="btn btn-sm household-leave-btn"
                                onClick={handleLeave}
                                disabled={leaveLoading}
                            >
                                {leaveLoading ? 'Leaving…' : 'Yes, leave'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
