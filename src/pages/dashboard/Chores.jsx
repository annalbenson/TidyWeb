import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { API } from '../../api';

const FREQ_DAYS = { Daily: 1, Weekly: 7, Biweekly: 14, Monthly: 30 };
const FILTERS = ['All', 'Overdue', 'Due today', 'Upcoming'];

function daysUntilDue(chore) {
    if (!chore.lastDone) return -1;
    const last = chore.lastDone.toDate?.() ?? new Date(chore.lastDone);
    const next = new Date(last.getTime() + (FREQ_DAYS[chore.frequency] ?? 7) * 86400000);
    return Math.floor((next - new Date()) / 86400000);
}

function dueLabel(days) {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
}

function choreStatus(chore) {
    const days = daysUntilDue(chore);
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    return 'upcoming';
}

export default function Chores() {
    const user = useAuth();
    const uid = user?.uid;

    const [chores, setChores] = useState(null);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', frequency: 'Weekly', room: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid).then(setChores);
    }, [uid]);

    function filtered() {
        if (!chores) return [];
        return chores.filter(c => {
            const status = choreStatus(c);
            if (filter === 'All') return true;
            if (filter === 'Overdue') return status === 'overdue';
            if (filter === 'Due today') return status === 'due-today';
            if (filter === 'Upcoming') return status === 'upcoming';
            return true;
        });
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        const chore = { name: form.name.trim(), frequency: form.frequency, room: form.room.trim() || null };
        const added = await API.addChore(uid, chore);
        setChores(prev => [...(prev ?? []), { id: added.id, ...chore }]);
        setForm({ name: '', frequency: 'Weekly', room: '' });
        setShowModal(false);
        setSaving(false);
    }

    async function handleComplete(chore) {
        // Optimistic update
        const now = new Date();
        setChores(prev => prev.map(c => c.id === chore.id ? { ...c, lastDone: now } : c));
        await API.completeChore(uid, chore.id);
    }

    async function handleDelete(choreId) {
        setChores(prev => prev.filter(c => c.id !== choreId));
        await API.deleteChore(uid, choreId);
    }

    const list = filtered();

    return (
        <div>
            <div className="chores-header">
                <h2 className="page-title">Chores</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Chore</button>
            </div>

            <div className="filter-tabs">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={'filter-tab' + (filter === f ? ' active' : '')}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {chores === null ? (
                <div className="chore-grid">
                    {[1, 2, 3].map(i => <div key={i} className="chore-card skeleton" />)}
                </div>
            ) : list.length === 0 ? (
                <div className="empty-state">
                    {filter === 'All'
                        ? <>No chores yet — <button className="link-btn" onClick={() => setShowModal(true)}>add one!</button></>
                        : `No ${filter.toLowerCase()} chores.`}
                </div>
            ) : (
                <div className="chore-grid">
                    {list.map(chore => {
                        const status = choreStatus(chore);
                        const days = daysUntilDue(chore);
                        return (
                            <div key={chore.id} className={`chore-card ${status}`}>
                                <div className="chore-card-top">
                                    <span className="chore-name">{chore.name}</span>
                                    <span className="chore-freq-badge">{chore.frequency}</span>
                                </div>
                                {chore.room && <span className="chore-room">🏠 {chore.room}</span>}
                                <span className={`chore-due ${status}`}>{dueLabel(days)}</span>
                                <div className="chore-actions">
                                    <button className="btn btn-primary btn-sm" onClick={() => handleComplete(chore)}>Complete</button>
                                    <button className="btn btn-sm chore-delete" onClick={() => handleDelete(chore.id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Add Chore</h3>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Chore name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Vacuum living room"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Frequency</label>
                                <select
                                    value={form.frequency}
                                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                                >
                                    {Object.keys(FREQ_DAYS).map(k => <option key={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Room <span className="optional">(optional)</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kitchen"
                                    value={form.room}
                                    onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                                    {saving ? 'Saving…' : 'Add Chore'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
