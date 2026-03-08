import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { API } from '../../api';
import { FREQ_DAYS, daysUntilDue, dueLabel, choreStatus } from '../../utils/chores';

const FILTERS = ['All', 'Overdue', 'Due today', 'Upcoming'];
const STATUS_ORDER = { overdue: 0, 'due-today': 1, upcoming: 2 };

export const ROOM_NAMES = [
    { name: 'Kitchen',      emoji: '🍳' },
    { name: 'Bathroom',     emoji: '🛁' },
    { name: 'Bedroom',      emoji: '🛏️' },
    { name: 'Living Room',  emoji: '🛋️' },
    { name: 'Office',       emoji: '💼' },
    { name: 'Entryway',     emoji: '🚪' },
    { name: 'Laundry Room', emoji: '👔' },
    { name: 'Garage',       emoji: '🚗' },
];

export default function Chores() {
    const user = useAuth();
    const uid = user?.uid;

    const [chores, setChores] = useState(null);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', frequency: 'Weekly', room: '' });
    const [saving, setSaving] = useState(false);
    const [editChore, setEditChore] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', frequency: 'Weekly', room: '' });

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid).then(setChores);
    }, [uid]);

    function filtered() {
        if (!chores) return [];
        return chores
            .filter(c => {
                const status = choreStatus(c);
                if (filter === 'All') return true;
                if (filter === 'Overdue') return status === 'overdue';
                if (filter === 'Due today') return status === 'due-today';
                if (filter === 'Upcoming') return status === 'upcoming';
                return true;
            })
            .sort((a, b) => {
                const sa = STATUS_ORDER[choreStatus(a)] ?? 2;
                const sb = STATUS_ORDER[choreStatus(b)] ?? 2;
                if (sa !== sb) return sa - sb;
                return daysUntilDue(a) - daysUntilDue(b);
            });
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const chore = { name: form.name.trim(), frequency: form.frequency, room: form.room || null };
            const added = await API.addChore(uid, chore);
            setChores(prev => [...(prev ?? []), { id: added.id, ...chore }]);
            setForm({ name: '', frequency: 'Weekly', room: '' });
            setShowModal(false);
        } finally {
            setSaving(false);
        }
    }

    function openEdit(chore) {
        setEditChore(chore);
        setEditForm({ name: chore.name, frequency: chore.frequency, room: chore.room ?? '' });
    }

    async function handleEdit(e) {
        e.preventDefault();
        if (!editForm.name.trim()) return;
        const previous = chores;
        const updates = { name: editForm.name.trim(), frequency: editForm.frequency, room: editForm.room || null };
        setChores(prev => prev.map(c => c.id === editChore.id ? { ...c, ...updates } : c));
        setEditChore(null);
        try {
            await API.updateChore(uid, editChore.id, updates);
        } catch {
            setChores(previous);
        }
    }

    async function handleComplete(e, chore) {
        e.stopPropagation();
        const previous = chores;
        const now = new Date();
        setChores(prev => prev.map(c => c.id === chore.id ? { ...c, lastDone: now } : c));
        try {
            await API.completeChore(uid, chore.id);
        } catch {
            setChores(previous);
        }
    }

    async function handleDelete(e, choreId) {
        e.stopPropagation();
        const previous = chores;
        setChores(prev => prev.filter(c => c.id !== choreId));
        try {
            await API.deleteChore(uid, choreId);
        } catch {
            setChores(previous);
        }
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
                            <div key={chore.id} className={`chore-card ${status}`} onClick={() => openEdit(chore)}>
                                <div className="chore-card-top">
                                    <span className="chore-name">{chore.name}</span>
                                    <span className="chore-freq-badge">{chore.frequency}</span>
                                </div>
                                {chore.room && <span className="chore-room">🏠 {chore.room}</span>}
                                <span className={`chore-due ${status}`}>{dueLabel(days)}</span>
                                <div className="chore-actions">
                                    <button className="btn btn-primary btn-sm" onClick={e => handleComplete(e, chore)}>Complete</button>
                                    <button className="btn btn-sm chore-delete" onClick={e => handleDelete(e, chore.id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add modal */}
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
                                <select
                                    value={form.room}
                                    onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                                >
                                    <option value="">None</option>
                                    {ROOM_NAMES.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                </select>
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

            {/* Edit modal */}
            {editChore && (
                <div className="modal-overlay" onClick={() => setEditChore(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Edit Chore</h3>
                        <form onSubmit={handleEdit}>
                            <div className="form-group">
                                <label>Chore name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Frequency</label>
                                <select
                                    value={editForm.frequency}
                                    onChange={e => setEditForm(f => ({ ...f, frequency: e.target.value }))}
                                >
                                    {Object.keys(FREQ_DAYS).map(k => <option key={k}>{k}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Room <span className="optional">(optional)</span></label>
                                <select
                                    value={editForm.room}
                                    onChange={e => setEditForm(f => ({ ...f, room: e.target.value }))}
                                >
                                    <option value="">None</option>
                                    {ROOM_NAMES.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-sm" onClick={() => setEditChore(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
