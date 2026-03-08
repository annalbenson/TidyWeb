import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { API } from '../../api';
import { ROOM_NAMES } from './Chores';
import { daysUntilDue, dueLabel, choreStatus } from '../../utils/chores';

export default function Rooms() {
    const user = useAuth();
    const uid = user?.uid;

    const [chores, setChores] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid).then(setChores);
    }, [uid]);

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
            await API.completeChore(uid, chore.id);
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
                    const count = chores ? choresByRoom(room.name).length : 0;
                    const overdue = chores ? overdueCount(room.name) : 0;
                    const isSelected = selectedRoom?.name === room.name;
                    return (
                        <button
                            key={room.name}
                            className={'room-card' + (isSelected ? ' selected' : '')}
                            onClick={() => setSelectedRoom(isSelected ? null : room)}
                        >
                            <span className="room-emoji">{room.emoji}</span>
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
