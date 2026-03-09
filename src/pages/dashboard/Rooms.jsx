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

export default function Rooms() {
    const user = useAuth();
    const uid = user?.uid;
    const { householdId } = useHousehold();

    const [chores, setChores] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid, householdId).then(setChores);
        const onUpdate = () => API.getChores(uid, householdId).then(setChores);
        window.addEventListener('tilly:chores-updated', onUpdate);
        return () => window.removeEventListener('tilly:chores-updated', onUpdate);
    }, [uid, householdId]);

    function choresByRoom(roomName) {
        if (!chores) return [];
        return chores.filter(c => c.room?.toLowerCase() === roomName.toLowerCase());
    }

    function overdueCount(roomName) {
        return choresByRoom(roomName).filter(c => choreStatus(c) === 'overdue').length;
    }

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

    const roomChores = selectedRoom ? choresByRoom(selectedRoom.name) : [];

    return (
        <div>
            <div className="chores-header">
                <h2 className="page-title">Rooms</h2>
            </div>

            <div className="room-grid">
                {ROOM_NAMES.map(room => {
                    const roomList = chores ? choresByRoom(room.name) : [];
                    const count = roomList.length;
                    const overdue = chores ? overdueCount(room.name) : 0;
                    const scheduled = roomList.filter(c => c.frequency !== 'As needed');
                    const done = scheduled.filter(c => choreStatus(c) !== 'overdue').length;
                    const isSelected = selectedRoom?.name === room.name;
                    return (
                        <button
                            key={room.name}
                            className={'room-card' + (isSelected ? ' selected' : '')}
                            onClick={() => setSelectedRoom(isSelected ? null : room)}
                        >
                            <RoomRing done={done} total={scheduled.length} emoji={room.emoji} />
                            <span className="room-name">{room.name}</span>
                            <span className="room-count">{count} chore{count !== 1 ? 's' : ''}</span>
                            {overdue > 0 && <span className="room-overdue">{overdue} overdue</span>}
                        </button>
                    );
                })}
            </div>

            {selectedRoom && (
                <div className="room-detail">
                    <h3 className="room-detail-title">{selectedRoom.emoji} {selectedRoom.name}</h3>
                    {roomChores.length === 0 ? (
                        <p className="empty-state">No chores in this room yet.</p>
                    ) : (
                        <div className="room-chore-list">
                            {roomChores.map(chore => {
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
