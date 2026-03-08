import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { API } from '../../api';
import { daysUntilDue, dueLabel } from '../../utils/chores';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COL_ORDER = { overdue: 0, 'due-week': 1, 'coming-up': 2 };

function weekLabel() {
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = d => `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
    return `Week of ${fmt(monday)} – ${fmt(sunday)}`;
}

function PlanCard({ chore, status, isDragging, onDragStart, onDragEnd, onAction }) {
    const days = daysUntilDue(chore);
    const draggable = status !== 'coming-up';
    return (
        <div
            className={`plan-card ${status}${isDragging ? ' dragging' : ''}${draggable ? ' draggable' : ''}`}
            draggable={draggable}
            onDragStart={draggable ? e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', chore.id); onDragStart(chore, status); } : undefined}
            onDragEnd={draggable ? onDragEnd : undefined}
        >
            <span className="plan-card-name">{chore.name}</span>
            {chore.room && <span className="plan-card-meta">🏠 {chore.room}</span>}
            <span className="plan-card-meta">{chore.frequency}</span>
            <span className={`plan-card-due ${status}`}>{dueLabel(days)}</span>
            {status !== 'coming-up' && (
                <div className="plan-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => onAction(chore)}>Complete</button>
                    <button className="btn btn-sm chore-delete" onClick={() => onAction(chore)}>Snooze</button>
                </div>
            )}
        </div>
    );
}

function PlanColumn({ colKey, title, count, children, dragOverCol, draggingCol, onDragOver, onDragLeave, onDrop }) {
    const isOver = dragOverCol === colKey;
    const isValid = draggingCol !== null && COL_ORDER[colKey] > COL_ORDER[draggingCol];
    const colClass = [
        'plan-column',
        isOver && isValid   ? 'drag-over-valid'  : '',
        isOver && !isValid  ? 'drag-over-reject' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={colClass}
            onDragOver={e => { e.preventDefault(); onDragOver(colKey); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave(); }}
            onDrop={e => { e.preventDefault(); onDrop(colKey); }}
        >
            <div className="plan-column-header">
                <span className={`plan-column-title ${colKey}`}>{title}</span>
                <span className="plan-column-count">{count}</span>
            </div>
            {children}
        </div>
    );
}

export default function Plan() {
    const user = useAuth();
    const uid = user?.uid;
    const [chores, setChores] = useState(null);
    const [dragging, setDragging] = useState(null);   // { choreId, colKey } — for visuals
    const [dragOverCol, setDragOverCol] = useState(null);
    const dragRef = useRef(null);                      // authoritative drag data for drop handler

    useEffect(() => {
        if (!uid) return;
        API.getChores(uid).then(setChores);
        const onUpdate = () => API.getChores(uid).then(setChores);
        window.addEventListener('tilly:chores-updated', onUpdate);
        return () => window.removeEventListener('tilly:chores-updated', onUpdate);
    }, [uid]);

    async function handleAction(chore) {
        const previous = chores;
        const now = new Date();
        setChores(prev => prev.map(c => c.id === chore.id ? { ...c, lastDone: now } : c));
        try {
            await API.completeChore(uid, chore.id);
        } catch {
            setChores(previous);
        }
    }

    function handleDragStart(chore, colKey) {
        dragRef.current = { choreId: chore.id, colKey };
        setDragging({ choreId: chore.id, colKey });
    }

    function handleDragEnd() {
        dragRef.current = null;
        setDragging(null);
        setDragOverCol(null);
    }

    function handleDrop(targetCol) {
        const drag = dragRef.current;
        dragRef.current = null;
        setDragging(null);
        setDragOverCol(null);
        if (!drag) return;
        if (COL_ORDER[targetCol] > COL_ORDER[drag.colKey]) {
            const chore = chores.find(c => c.id === drag.choreId);
            if (chore) handleAction(chore);
        }
    }

    if (chores === null) {
        return (
            <div>
                <h2 className="page-title">Weekly Plan</h2>
                <p className="plan-subtitle">{weekLabel()}</p>
                <div className="plan-columns">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="plan-column">
                            <div className="chore-card skeleton" style={{ height: 100 }} />
                            <div className="chore-card skeleton" style={{ height: 100 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const overdue  = chores.filter(c => daysUntilDue(c) < 0)
                           .sort((a, b) => daysUntilDue(a) - daysUntilDue(b));
    const dueWeek  = chores.filter(c => { const d = daysUntilDue(c); return d >= 0 && d <= 7; })
                           .sort((a, b) => daysUntilDue(a) - daysUntilDue(b));
    const comingUp = chores.filter(c => daysUntilDue(c) > 7)
                           .sort((a, b) => daysUntilDue(a) - daysUntilDue(b));

    const colProps = {
        dragOverCol,
        draggingCol: dragging?.colKey ?? null,
        onDragOver: setDragOverCol,
        onDragLeave: () => setDragOverCol(null),
        onDrop: handleDrop,
    };

    function cards(list, status) {
        return list.map(c => (
            <PlanCard
                key={c.id}
                chore={c}
                status={status}
                isDragging={dragging?.choreId === c.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onAction={handleAction}
            />
        ));
    }

    return (
        <div>
            <h2 className="page-title">Weekly Plan</h2>
            <p className="plan-subtitle">{weekLabel()}</p>
            <div className="plan-columns">
                <PlanColumn colKey="overdue" title="Overdue" count={overdue.length} {...colProps}>
                    {overdue.length === 0
                        ? <p className="plan-empty">You're all caught up! 🌿</p>
                        : cards(overdue, 'overdue')}
                </PlanColumn>

                <PlanColumn colKey="due-week" title="Due This Week" count={dueWeek.length} {...colProps}>
                    {dueWeek.length === 0
                        ? <p className="plan-empty">Nothing due this week.</p>
                        : cards(dueWeek, 'due-week')}
                </PlanColumn>

                <PlanColumn colKey="coming-up" title="Coming Up" count={comingUp.length} {...colProps}>
                    {comingUp.length === 0
                        ? <p className="plan-empty">No upcoming chores.</p>
                        : cards(comingUp, 'coming-up')}
                </PlanColumn>
            </div>
        </div>
    );
}
