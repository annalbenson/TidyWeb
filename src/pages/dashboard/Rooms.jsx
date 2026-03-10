import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useHousehold } from '../../contexts/HouseholdContext';
import { API } from '../../api';
import { ROOM_NAMES } from './Chores';
import { daysUntilDue, dueLabel, choreStatus } from '../../utils/chores';

function RoomRing({ done, total, emoji }) {
    const pct = total === 0 ? 0 : done / total;
    const r = 24;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct);
    const strokeColor = pct === 1 ? 'var(--primary)' : pct === 0 ? 'var(--terracotta)' : 'var(--accent)';
    return (
        <div className="room-ring-wrap">
            <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r={r} fill="none" stroke="var(--outline)" strokeWidth="3" />
                {total > 0 && (
                    <circle
                        cx="28" cy="28" r={r}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 28 28)"
                    />
                )}
            </svg>
            <span className="room-ring-emoji">{emoji}</span>
        </div>
    );
}

function emojiForType(type) {
    return ROOM_NAMES.find(r => r.name === type)?.emoji ?? '🏠';
}

export default function Rooms() {
    const user = useAuth();
    const uid = user?.uid;
    const { householdId } = useHousehold();

    const [chores, setChores] = useState(null);
    const [userRooms, setUserRooms] = useState([]); // [{ id, name, type }]
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('tidy:rooms-view') ?? 'type');
    const [selectedKey, setSelectedKey] = useState(null); // typeName (type view) or roomId (name view)
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState(ROOM_NAMES[0].name);
    const [addSaving, setAddSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // roomId
    const [renameRoomId, setRenameRoomId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid, householdId).then(setChores);
        API.getRooms(uid).then(setUserRooms);
        const onUpdate = () => API.getChores(uid, householdId).then(setChores);
        window.addEventListener('tilly:chores-updated', onUpdate);
        return () => window.removeEventListener('tilly:chores-updated', onUpdate);
    }, [uid, householdId]);

    function switchViewMode(mode) {
        setViewMode(mode);
        setSelectedKey(null);
        localStorage.setItem('tidy:rooms-view', mode);
    }

    // ── Chore filters ─────────────────────────────────────────────────────────

    // Type view: match chores whose room name equals the type OR belongs to a named room of that type
    function choresByType(typeName) {
        if (!chores) return [];
        const linked = new Set([typeName.toLowerCase()]);
        userRooms.filter(r => r.type === typeName).forEach(r => linked.add(r.name.toLowerCase()));
        return chores.filter(c => linked.has(c.room?.toLowerCase() ?? ''));
    }

    // Name view: exact match by room name
    function choresByRoomName(name) {
        if (!chores) return [];
        return chores.filter(c => c.room?.toLowerCase() === name.toLowerCase());
    }

    function overdueInSet(choreList) {
        return choreList.filter(c => choreStatus(c) === 'overdue').length;
    }

    // ── Complete ──────────────────────────────────────────────────────────────

    async function handleComplete(chore) {
        const previous = chores;
        const now = new Date();
        setChores(prev => prev.map(c => c.id === chore.id ? { ...c, lastDone: now } : c));
        try {
            await API.completeChore(uid, chore.id, householdId);
        } catch {
            setChores(previous);
        }
    }

    // ── Add / delete rooms ────────────────────────────────────────────────────

    async function handleAddRoom(e) {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        setAddSaving(true);
        try {
            const id = await API.addRoom(uid, { name, type: newType });
            setUserRooms(prev => [...prev, { id, name, type: newType }]);
            setNewName('');
            setNewType(ROOM_NAMES[0].name);
            setShowAddRoom(false);
        } finally {
            setAddSaving(false);
        }
    }

    async function handleRenameRoom() {
        const newName = renameValue.trim();
        if (!newName || !renameRoomId) return;
        const room = userRooms.find(r => r.id === renameRoomId);
        if (!room) return;
        const oldName = room.name;
        if (newName === oldName) { setRenameRoomId(null); return; }

        await API.updateRoom(uid, renameRoomId, { name: newName });

        // cascade: update any chores that reference the old room name
        const affected = (chores ?? []).filter(c => c.room === oldName);
        await Promise.allSettled(
            affected.map(c => API.updateChore(uid, c.id, { room: newName }, householdId))
        );

        setUserRooms(prev => prev.map(r => r.id === renameRoomId ? { ...r, name: newName } : r));
        setChores(prev => prev?.map(c => c.room === oldName ? { ...c, room: newName } : c) ?? prev);
        setRenameRoomId(null);
    }

    async function handleDeleteRoom(roomId) {
        await API.deleteRoom(uid, roomId);
        setUserRooms(prev => prev.filter(r => r.id !== roomId));
        if (selectedKey === roomId) setSelectedKey(null);
        setDeleteConfirm(null);
    }

    // ── Detail panel content ──────────────────────────────────────────────────

    let detailChores = [];
    let detailTitle = '';
    let detailEmoji = '';
    let detailSubtitle = '';
    let detailRoomId = null;

    if (selectedKey) {
        if (viewMode === 'type') {
            const room = ROOM_NAMES.find(r => r.name === selectedKey);
            detailChores = choresByType(selectedKey);
            detailTitle = selectedKey;
            detailEmoji = room?.emoji ?? '🏠';
        } else {
            const room = userRooms.find(r => r.id === selectedKey);
            if (room) {
                detailChores = choresByRoomName(room.name);
                detailTitle = room.name;
                detailEmoji = emojiForType(room.type);
                detailSubtitle = room.type !== room.name ? room.type : '';
                detailRoomId = room.id;
            }
        }
    }

    // ── Render helpers ────────────────────────────────────────────────────────

    function renderTypeCard(room) {
        const choreList = choresByType(room.name);
        const count = choreList.length;
        const overdue = overdueInSet(choreList);
        const scheduled = choreList.filter(c => c.frequency !== 'As needed');
        const done = scheduled.filter(c => choreStatus(c) !== 'overdue').length;
        const isSelected = selectedKey === room.name;
        return (
            <button
                key={room.name}
                className={'room-card' + (isSelected ? ' selected' : '')}
                onClick={() => setSelectedKey(isSelected ? null : room.name)}
            >
                <RoomRing done={done} total={scheduled.length} emoji={room.emoji} />
                <span className="room-name">{room.name}</span>
                <span className="room-count">{count} chore{count !== 1 ? 's' : ''}</span>
                {overdue > 0 && <span className="room-overdue">{overdue} overdue</span>}
            </button>
        );
    }

    function renderNameCard(room) {
        const choreList = choresByRoomName(room.name);
        const count = choreList.length;
        const overdue = overdueInSet(choreList);
        const scheduled = choreList.filter(c => c.frequency !== 'As needed');
        const done = scheduled.filter(c => choreStatus(c) !== 'overdue').length;
        const isSelected = selectedKey === room.id;
        return (
            <button
                key={room.id}
                className={'room-card' + (isSelected ? ' selected' : '')}
                onClick={() => setSelectedKey(isSelected ? null : room.id)}
            >
                <RoomRing done={done} total={scheduled.length} emoji={emojiForType(room.type)} />
                <span className="room-name">{room.name}</span>
                {room.type !== room.name && <span className="room-type-label">{room.type}</span>}
                <span className="room-count">{count} chore{count !== 1 ? 's' : ''}</span>
                {overdue > 0 && <span className="room-overdue">{overdue} overdue</span>}
            </button>
        );
    }

    return (
        <div>
            <div className="rooms-page-header">
                <h2 className="page-title">Rooms</h2>
                <div className="plan-view-toggle">
                    <button className={`plan-toggle-btn${viewMode === 'type' ? ' active' : ''}`} onClick={() => switchViewMode('type')}>By Type</button>
                    <button className={`plan-toggle-btn${viewMode === 'name' ? ' active' : ''}`} onClick={() => switchViewMode('name')}>By Name</button>
                </div>
            </div>

            {/* ── Type view ── */}
            {viewMode === 'type' && (
                <div className="room-grid">
                    {ROOM_NAMES.map(renderTypeCard)}
                </div>
            )}

            {/* ── Name view ── */}
            {viewMode === 'name' && (
                <>
                    {userRooms.length === 0 ? (
                        <p className="empty-state" style={{ marginTop: 32 }}>
                            No named rooms yet — add one to track rooms individually.
                        </p>
                    ) : (
                        <div className="room-grid">
                            {userRooms.map(renderNameCard)}
                        </div>
                    )}
                    {showAddRoom ? (
                        <form onSubmit={handleAddRoom} className="add-room-form">
                            <input
                                className="nickname-input"
                                autoFocus
                                placeholder="e.g. Master Bathroom"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                maxLength={40}
                            />
                            <select
                                className="add-room-type-select"
                                value={newType}
                                onChange={e => setNewType(e.target.value)}
                            >
                                {ROOM_NAMES.map(r => (
                                    <option key={r.name} value={r.name}>{r.emoji} {r.name}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={addSaving}>
                                {addSaving ? 'Saving…' : 'Add'}
                            </button>
                            <button type="button" className="btn btn-sm" onClick={() => setShowAddRoom(false)}>Cancel</button>
                        </form>
                    ) : (
                        <button className="add-room-btn" onClick={() => setShowAddRoom(true)}>+ Add Room</button>
                    )}
                </>
            )}

            {/* ── Detail panel ── */}
            {selectedKey && detailTitle && (
                <div className="room-detail">
                    <div className="room-detail-header">
                        {renameRoomId !== null && renameRoomId === detailRoomId ? (
                            <>
                                <input
                                    className="room-rename-input"
                                    autoFocus
                                    value={renameValue}
                                    maxLength={40}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleRenameRoom();
                                        if (e.key === 'Escape') setRenameRoomId(null);
                                    }}
                                />
                                <span className="room-rename-actions">
                                    <button className="btn btn-primary btn-sm" onClick={handleRenameRoom} disabled={!renameValue.trim()}>Save</button>
                                    <button className="btn btn-sm" onClick={() => setRenameRoomId(null)}>Cancel</button>
                                </span>
                            </>
                        ) : (
                            <>
                                <h3 className="room-detail-title">
                                    {detailEmoji} {detailTitle}
                                    {detailSubtitle && <span className="room-detail-type">{detailSubtitle}</span>}
                                </h3>
                                {detailRoomId && (
                                    deleteConfirm === detailRoomId ? (
                                        <span className="room-delete-confirm">
                                            Remove room?
                                            <button className="btn btn-sm room-delete-btn" onClick={() => handleDeleteRoom(detailRoomId)}>Yes</button>
                                            <button className="btn btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                                        </span>
                                    ) : (
                                        <span className="room-header-actions">
                                            <button className="nickname-rename-btn" onClick={() => { setRenameRoomId(detailRoomId); setRenameValue(detailTitle); }}>Rename</button>
                                            <button className="nickname-rename-btn" onClick={() => setDeleteConfirm(detailRoomId)}>Remove room</button>
                                        </span>
                                    )
                                )}
                            </>
                        )}
                    </div>

                    {detailChores.length === 0 ? (
                        <p className="empty-state">No chores in this room yet.</p>
                    ) : (
                        <div className="room-chore-list">
                            {detailChores.map(chore => {
                                const status = choreStatus(chore);
                                const days = daysUntilDue(chore);
                                return (
                                    <div key={chore.id} className="room-chore-row">
                                        <div className="room-chore-info">
                                            <span className="chore-name">{chore.name}</span>
                                            <span className="chore-freq-badge">{chore.frequency}</span>
                                        </div>
                                        <div className="room-chore-right">
                                            <span className={`chore-due ${status}`}>{dueLabel(days)}</span>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleComplete(chore)}>Complete</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
