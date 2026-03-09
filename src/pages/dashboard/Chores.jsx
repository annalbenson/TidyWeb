import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { useHousehold } from '../../contexts/HouseholdContext';
import { API } from '../../api';
import { FREQ_DAYS, daysUntilDue, dueLabel, choreStatus } from '../../utils/chores';

function formatDate(ts) {
    if (!ts) return 'Never';
    const d = ts.toDate?.() ?? new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nextDueDate(chore) {
    const anchor = chore.lastDone ?? chore.createdAt;
    if (!anchor || chore.frequency === 'As needed') return null;
    const last = anchor.toDate?.() ?? new Date(anchor);
    return new Date(last.getTime() + (FREQ_DAYS[chore.frequency] ?? 7) * 86400000);
}

const FILTERS = ['All', 'Overdue', 'Due today', 'Upcoming'];
const STATUS_ORDER = { overdue: 0, 'due-today': 1, upcoming: 2 };
const FREQUENCIES = [...Object.keys(FREQ_DAYS), 'As needed'];

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

// Detect touch-only devices once at module level
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

function SwipeChoreCard({ chore, members, onComplete, onDelete, onClick }) {
    const [swipeX, setSwipeX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const startXRef = useRef(0);
    const pointerCapturedRef = useRef(false);
    const cardRef = useRef(null);

    const status = choreStatus(chore);
    const days = daysUntilDue(chore);

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function onPointerDown(e) {
        if (!IS_TOUCH) return;
        startXRef.current = e.clientX;
        cardRef.current?.setPointerCapture(e.pointerId);
        pointerCapturedRef.current = true;
    }

    function onPointerMove(e) {
        if (!IS_TOUCH || !pointerCapturedRef.current) return;
        const delta = e.clientX - startXRef.current;
        setSwipeX(clamp(delta, -120, 120));
        setIsSwiping(true);
    }

    function onPointerUp(e) {
        if (!IS_TOUCH || !pointerCapturedRef.current) return;
        pointerCapturedRef.current = false;
        if (swipeX > 60) {
            onComplete(e, chore);
        } else if (swipeX < -60) {
            onDelete(e, chore.id);
        }
        setSwipeX(0);
        setIsSwiping(false);
    }

    function onPointerCancel() {
        pointerCapturedRef.current = false;
        setSwipeX(0);
        setIsSwiping(false);
    }

    function handleClick(e) {
        if (isSwiping || Math.abs(swipeX) > 5) return;
        onClick(chore);
    }

    return (
        <div className="chore-card-wrapper">
            <div className="chore-swipe-reveal right">✓</div>
            <div className="chore-swipe-reveal left">🗑</div>
            <div
                ref={cardRef}
                className={`chore-card ${status ?? ''}`}
                style={{
                    transform: `translateX(${swipeX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.25s ease',
                    position: 'relative',
                    zIndex: 1,
                    touchAction: 'pan-y',
                    cursor: 'pointer',
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onClick={handleClick}
            >
                <div className="chore-card-top">
                    <span className="chore-name">{chore.name}</span>
                    <span className="chore-freq-badge">{chore.frequency}</span>
                </div>
                {chore.room && <span className="chore-room">🏠 {chore.room}</span>}
                {chore.assignedTo && members[chore.assignedTo] && (
                    <span className="assignee-badge">👤 {members[chore.assignedTo].name}</span>
                )}
                <span className={`chore-due ${status ?? ''}`}>{dueLabel(days)}</span>
                {IS_TOUCH ? null : (
                    <div className="chore-actions">
                        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onComplete(e, chore); }}>Complete</button>
                        <button className="btn btn-sm chore-delete" onClick={e => { e.stopPropagation(); onDelete(e, chore.id); }}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Chores() {
    const user = useAuth();
    const uid = user?.uid;
    const { householdId, members } = useHousehold();

    const [chores, setChores] = useState(null);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', frequency: 'Weekly', room: '' });
    const [saving, setSaving] = useState(false);
    const [editChore, setEditChore] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', frequency: 'Weekly', room: '' });
    const [editAssignedTo, setEditAssignedTo] = useState(null);

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid, householdId).then(setChores);
        const onUpdate = () => API.getChores(uid, householdId).then(setChores);
        window.addEventListener('tilly:chores-updated', onUpdate);
        return () => window.removeEventListener('tilly:chores-updated', onUpdate);
    }, [uid, householdId]);

    function filtered() {
        if (!chores) return [];
        return chores
            .filter(c => {
                const status = choreStatus(c);
                if (filter === 'All') return true;
                // As-needed chores (status null) only appear under All
                if (status === null) return false;
                if (filter === 'Overdue') return status === 'overdue';
                if (filter === 'Due today') return status === 'due-today';
                if (filter === 'Upcoming') return status === 'upcoming';
                return true;
            })
            .sort((a, b) => {
                const sa = STATUS_ORDER[choreStatus(a)] ?? 99;
                const sb = STATUS_ORDER[choreStatus(b)] ?? 99;
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
            const added = await API.addChore(uid, chore, householdId);
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
        setEditAssignedTo(chore.assignedTo ?? null);
    }

    async function handleEdit(e) {
        e.preventDefault();
        if (!editForm.name.trim()) return;
        const previous = chores;
        const updates = {
            name: editForm.name.trim(),
            frequency: editForm.frequency,
            room: editForm.room || null,
            assignedTo: editAssignedTo ?? null,
        };
        setChores(prev => prev.map(c => c.id === editChore.id ? { ...c, ...updates } : c));
        setEditChore(null);
        try {
            await API.updateChore(uid, editChore.id, updates, householdId);
        } catch {
            setChores(previous);
        }
    }

    async function handleComplete(e, chore) {
        e.stopPropagation();
        const previous = chores;
        const now = new Date();
        setChores(prev => prev.map(c => c.id === chore.id ? { ...c, lastDone: now, completionCount: (c.completionCount ?? 0) + 1 } : c));
        try {
            await API.completeChore(uid, chore.id, householdId);
        } catch {
            setChores(previous);
        }
    }

    async function handleDelete(e, choreId) {
        e.stopPropagation();
        const previous = chores;
        setChores(prev => prev.filter(c => c.id !== choreId));
        try {
            await API.deleteChore(uid, choreId, householdId);
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
                    {list.map(chore => (
                        <SwipeChoreCard
                            key={chore.id}
                            chore={chore}
                            members={members}
                            onComplete={handleComplete}
                            onDelete={handleDelete}
                            onClick={openEdit}
                        />
                    ))}
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
                                    {FREQUENCIES.map(k => <option key={k}>{k}</option>)}
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
                        <div className="chore-detail-strip">
                            <div className="chore-detail-item">
                                <span className="chore-detail-label">Last done</span>
                                <span className="chore-detail-value">{formatDate(editChore.lastDone)}</span>
                            </div>
                            <div className="chore-detail-item">
                                <span className="chore-detail-label">Next due</span>
                                <span className="chore-detail-value">{formatDate(nextDueDate(editChore))}</span>
                            </div>
                            <div className="chore-detail-item">
                                <span className="chore-detail-label">Completed</span>
                                <span className="chore-detail-value">
                                    {editChore.completionCount == null ? '—' : editChore.completionCount === 1 ? '1 time' : `${editChore.completionCount} times`}
                                </span>
                            </div>
                        </div>
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
                                    {FREQUENCIES.map(k => <option key={k}>{k}</option>)}
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
                            {Object.keys(members).length > 0 && (
                                <div className="form-group">
                                    <label>Assign to <span className="optional">(optional)</span></label>
                                    <select
                                        value={editAssignedTo ?? ''}
                                        onChange={e => setEditAssignedTo(e.target.value || null)}
                                    >
                                        <option value="">Unassigned</option>
                                        {Object.entries(members).map(([memberId, { name }]) => (
                                            <option key={memberId} value={memberId}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
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
