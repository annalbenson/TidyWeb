import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useHousehold } from '../../contexts/HouseholdContext';
import { API } from '../../api';
import { daysUntilDue, dueLabel } from '../../utils/chores';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIMES  = ['morning', 'afternoon', 'evening'];
const TIME_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

function getWeekDates() {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // back to Sunday
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}

function getRollingDates() {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function dayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return { name: DAYS[d.getDay()], date: `${MONTHS[d.getMonth()]} ${d.getDate()}` };
}

function choreStatus(chore) {
    const days = daysUntilDue(chore);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'due-week';
    return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UnscheduledChip({ chore, isDragging, onDragStart }) {
    const status = choreStatus(chore);
    return (
        <div
            className={`unscheduled-chip${status ? ` ${status}` : ''}${isDragging ? ' dragging' : ''}`}
            draggable
            onDragStart={onDragStart}
        >
            {chore.name}
        </div>
    );
}

function ScheduledCard({ chore, isDragging, onDragStart, onComplete }) {
    const status = choreStatus(chore);
    const completed = daysUntilDue(chore) >= 0 && !!chore.lastDone;

    return (
        <div
            className={`scheduled-card${status ? ` ${status}` : ''}${isDragging ? ' dragging' : ''}${completed ? ' completed' : ''}`}
            draggable
            onDragStart={onDragStart}
        >
            <span className="scheduled-card-name">{chore.name}</span>
            {chore.room && <span className="scheduled-card-meta">🏠 {chore.room}</span>}
            <span className="scheduled-card-meta">{chore.frequency === 'Daily' ? 'Daily · every day' : dueLabel(daysUntilDue(chore))}</span>
            <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 4, alignSelf: 'flex-start' }}
                onClick={() => onComplete(chore.id)}
            >
                Complete
            </button>
        </div>
    );
}

function TimeSlot({ date, time, chores, draggingId, isOver, onDragEnter, onDragLeave, onDrop, onDragStart, onComplete }) {
    return (
        <div
            className={`time-slot${isOver ? ' drop-over' : ''}`}
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => { e.preventDefault(); onDragEnter(date, time); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave(); }}
            onDrop={e => onDrop(e, date, time)}
        >
            <span className="time-slot-label">{TIME_LABELS[time]}</span>
            {chores.map(c => (
                <ScheduledCard
                    key={c.id}
                    chore={c}
                    isDragging={draggingId === c.id}
                    onDragStart={onDragStart(c.id, 'board')}
                    onComplete={onComplete}
                />
            ))}
        </div>
    );
}

function DayColumn({ dateStr, isToday, chores, draggingId, dropTarget, onDragEnter, onDragLeave, onDrop, onDragStart, onComplete }) {
    const { name, date } = dayLabel(dateStr);
    return (
        <div className="day-column">
            <div className={`day-column-header${isToday ? ' today' : ''}`}>
                <div className="day-column-name">{name}</div>
                <div className="day-column-date">{date}</div>
            </div>
            <div className="time-slots">
                {TIMES.map(time => (
                    <TimeSlot
                        key={time}
                        date={dateStr}
                        time={time}
                        chores={chores.filter(c => c.scheduledTime === time).sort((a, b) => (b.scheduledDate === 'daily') - (a.scheduledDate === 'daily'))}
                        draggingId={draggingId}
                        isOver={dropTarget?.date === dateStr && dropTarget?.time === time}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                        onComplete={onComplete}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Plan() {
    const user = useAuth();
    const uid = user?.uid;
    const { householdId } = useHousehold();
    const [chores, setChores] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null); // {date, time} | 'strip' | null
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('tidy:plan-view') ?? 'week');

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid, householdId).then(setChores);
        const onUpdate = () => API.getChores(uid, householdId).then(setChores);
        window.addEventListener('tilly:chores-updated', onUpdate);
        return () => window.removeEventListener('tilly:chores-updated', onUpdate);
    }, [uid, householdId]);

    function switchViewMode(mode) {
        setViewMode(mode);
        localStorage.setItem('tidy:plan-view', mode);
    }

    const weekDates = viewMode === 'week' ? getWeekDates() : getRollingDates();
    const today = todayStr();

    // ── Handlers (optimistic) ─────────────────────────────────────────────────

    async function handleSchedule(choreId, scheduledDate, scheduledTime) {
        const chore = chores.find(c => c.id === choreId);
        const effectiveDate = chore?.frequency === 'Daily' ? 'daily' : scheduledDate;
        const previous = chores;
        setChores(prev => prev.map(c => c.id === choreId ? { ...c, scheduledDate: effectiveDate, scheduledTime } : c));
        try {
            await API.scheduleChore(uid, choreId, { scheduledDate: effectiveDate, scheduledTime }, householdId);
        } catch {
            setChores(previous);
        }
    }

    async function handleUnschedule(choreId) {
        const previous = chores;
        setChores(prev => prev.map(c => c.id === choreId ? { ...c, scheduledDate: null, scheduledTime: null } : c));
        try {
            await API.unscheduleChore(uid, choreId, householdId);
        } catch {
            setChores(previous);
        }
    }

    async function handleComplete(choreId) {
        const previous = chores;
        const now = new Date();
        setChores(prev => prev.map(c => c.id === choreId ? { ...c, lastDone: now } : c));
        try {
            await API.completeChore(uid, choreId, householdId);
        } catch {
            setChores(previous);
        }
    }

    // ── DnD ──────────────────────────────────────────────────────────────────

    function makeDragStart(choreId, source) {
        return e => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({ choreId, source }));
            setDraggingId(choreId);
        };
    }

    function handleDrop(e, targetDate, targetTime) {
        e.preventDefault();
        try {
            const { choreId, source } = JSON.parse(e.dataTransfer.getData('text/plain'));
            setDropTarget(null);
            setDraggingId(null);
            if (targetDate === 'strip') {
                if (source === 'board') handleUnschedule(choreId);
            } else {
                handleSchedule(choreId, targetDate, targetTime);
            }
        } catch { /* malformed */ }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (chores === null) {
        return (
            <div className="plan-page">
                <div className="unscheduled-strip">
                    <span className="unscheduled-label">THIS WEEK</span>
                    <div className="unscheduled-chips">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="unscheduled-chip" style={{ width: 80, background: 'var(--surface)' }} />
                        ))}
                    </div>
                </div>
                <div className="board-scroll">
                    <div className="board-grid">
                        {Array.from({ length: 7 }, (_, i) => (
                            <div key={i} className="day-column">
                                <div className="day-column-header" style={{ height: 52 }} />
                                <div className="time-slots">
                                    {TIMES.map(t => <div key={t} className="time-slot" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const unscheduled = chores.filter(c => daysUntilDue(c) < 8 && !c.scheduledDate);

    function slotChores(date) {
        return chores.filter(c => c.scheduledDate === date || c.scheduledDate === 'daily');
    }

    return (
        <div
            className="plan-page"
            onDragEnd={() => { setDraggingId(null); setDropTarget(null); }}
        >
            {/* Unscheduled strip */}
            <div className="unscheduled-strip-wrapper">
                <div className="unscheduled-strip-header">
                    <span className="unscheduled-label">THIS WEEK</span>
                    <div className="plan-view-toggle">
                        <button className={`plan-toggle-btn${viewMode === 'week' ? ' active' : ''}`} onClick={() => switchViewMode('week')}>Sun – Sat</button>
                        <button className={`plan-toggle-btn${viewMode === 'rolling' ? ' active' : ''}`} onClick={() => switchViewMode('rolling')}>Today →</button>
                    </div>
                </div>
                <div
                    className={`unscheduled-strip${dropTarget === 'strip' ? ' drop-over' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDragEnter={e => { e.preventDefault(); setDropTarget('strip'); }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null); }}
                    onDrop={e => handleDrop(e, 'strip', null)}
                >
                    <div className="unscheduled-chips">
                        {unscheduled.length === 0
                            ? <span className="strip-empty">All chores are scheduled</span>
                            : unscheduled.map(c => (
                                <UnscheduledChip
                                    key={c.id}
                                    chore={c}
                                    isDragging={draggingId === c.id}
                                    onDragStart={makeDragStart(c.id, 'strip')}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="board-scroll">
                <div className="board-grid">
                    {weekDates.map(dateStr => (
                        <DayColumn
                            key={dateStr}
                            dateStr={dateStr}
                            isToday={dateStr === today}
                            chores={slotChores(dateStr)}
                            draggingId={draggingId}
                            dropTarget={dropTarget}
                            onDragEnter={(date, time) => setDropTarget({ date, time })}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={handleDrop}
                            onDragStart={makeDragStart}
                            onComplete={handleComplete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
