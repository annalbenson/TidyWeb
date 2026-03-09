import { useState } from 'react';

const ROOMS = [
    { name: 'Kitchen',      emoji: '🍳' },
    { name: 'Bathroom',     emoji: '🛁' },
    { name: 'Bedroom',      emoji: '🛏️' },
    { name: 'Living Room',  emoji: '🛋️' },
    { name: 'Office',       emoji: '💼' },
    { name: 'Entryway',     emoji: '🚪' },
    { name: 'Laundry Room', emoji: '👔' },
    { name: 'Garage',       emoji: '🚗' },
];

const ROOM_TASKS = {
    'Kitchen': [
        { emoji: '🫙', title: 'Pantry shelf',              desc: 'Check expiration dates. Donate unexpired food you won\'t use. Group by type.' },
        { emoji: '🍱', title: 'Tupperware cabinet',        desc: 'Match lids to containers. Anything without a match goes.' },
        { emoji: '🧲', title: 'Junk drawer',               desc: 'If you don\'t know what it is or haven\'t used it in a year, toss it.' },
        { emoji: '🫙', title: 'Spice rack',                desc: 'Smell-test each one. Anything faded or expired gets replaced or tossed.' },
        { emoji: '🧴', title: 'Under-sink cabinet',        desc: 'Toss empty or duplicate cleaning products. Consolidate what\'s left.' },
        { emoji: '🍳', title: 'Rarely-used appliances',    desc: 'If it hasn\'t been on the counter or used in 6 months, store it or donate it.' },
        { emoji: '📚', title: 'Cookbooks',                  desc: 'Keep only the ones you actually open. Donate the rest.' },
        { emoji: '🛍️', title: 'Reusable bags',             desc: 'Sort the pile — keep what folds flat and fits. Recycle the rest.' },
        { emoji: '🧊', title: 'Fridge door',               desc: 'Toss expired condiments. Consolidate duplicates. Wipe down shelves.' },
        { emoji: '🥡', title: 'Cabinet of mystery items',  desc: 'One shelf at a time — if you can\'t remember buying it, you don\'t need it.' },
    ],
    'Bathroom': [
        { emoji: '💊', title: 'Medicine cabinet',          desc: 'Check dates — discard expired meds properly. Group what remains.' },
        { emoji: '🧴', title: 'Under-sink cabinet',        desc: 'Toss empty bottles, ancient products, and anything you switched away from.' },
        { emoji: '💇', title: 'Hair tools and products',   desc: 'Keep only what you use weekly. Donate or toss the rest.' },
        { emoji: '💄', title: 'Makeup or skincare drawer', desc: 'Anything older than a year or never opened — toss it.' },
        { emoji: '🪥', title: 'Counter clutter',           desc: 'Clear everything off. Only the daily-use items come back out.' },
        { emoji: '🛁', title: 'Old towels',                desc: 'Donate worn towels to an animal shelter. Only keep what you actually use.' },
        { emoji: '🧼', title: 'Extra soap and shampoo',    desc: 'Consolidate duplicates. Move backstock to one spot so you can see what you have.' },
        { emoji: '🪒', title: 'Razor and grooming supplies', desc: 'Toss dull blades and anything you\'ve stopped using.' },
    ],
    'Bedroom': [
        { emoji: '👗', title: 'One dresser drawer',        desc: 'Pull it out, dump it, and only put back what you actually wear.' },
        { emoji: '🛏️', title: 'Nightstand drawer',         desc: 'Empty it completely. Toss old receipts, dead pens, and anything random.' },
        { emoji: '👟', title: 'Closet floor',              desc: 'Pair up shoes. Donate anything you haven\'t worn in a year.' },
        { emoji: '🧳', title: 'Under the bed',             desc: 'Pull everything out. Donate, toss, or store properly — no orphan items.' },
        { emoji: '📚', title: 'Books on the nightstand',   desc: 'Keep your current read. The others can go back to the shelf or be donated.' },
        { emoji: '💍', title: 'Jewelry or accessories',    desc: 'Untangle, match, and donate anything you never reach for.' },
        { emoji: '🧸', title: 'Miscellaneous shelf items', desc: 'If it doesn\'t belong in a bedroom and you\'re not attached to it, rehome it.' },
        { emoji: '👔', title: 'Clothes you haven\'t worn', desc: 'If it hasn\'t been on your body in a year, it goes.' },
    ],
    'Living Room': [
        { emoji: '📚', title: 'Bookshelf',                 desc: 'Donate or recycle anything you\'ve already read and won\'t revisit.' },
        { emoji: '🛋️', title: 'Couch cushions',            desc: 'Pull everything out from behind and under them. Toss pillows you never use.' },
        { emoji: '🎮', title: 'Entertainment center',      desc: 'Wrangle cables, toss dead remotes, and remove anything that drifted here.' },
        { emoji: '🪴', title: 'Shelves and surfaces',      desc: 'Remove everything, dust, and only put back what you love or need.' },
        { emoji: '🗞️', title: 'Magazines and catalogs',   desc: 'Keep the current issue of anything you actually read. Recycle the rest.' },
        { emoji: '🎲', title: 'Games and media',           desc: 'Donate games you never play, DVDs you\'ll never watch again.' },
        { emoji: '🧸', title: 'Decorative items',          desc: 'If it\'s just collecting dust and you\'re not attached, it goes.' },
        { emoji: '🔌', title: 'Cables and chargers',       desc: 'Identify every cable. Toss anything with no matching device.' },
    ],
    'Office': [
        { emoji: '🖥️', title: 'Desk surface',             desc: 'Clear everything off. Only essentials come back on.' },
        { emoji: '🗂️', title: 'Paper pile',               desc: 'Sort: toss junk mail, shred old bills, file anything actually important.' },
        { emoji: '🖊️', title: 'Desk drawers',             desc: 'Empty one drawer. Toss dead pens, mystery items, and old receipts.' },
        { emoji: '💾', title: 'Old electronics and cables', desc: 'Toss anything broken. Properly recycle old devices you\'re done with.' },
        { emoji: '📚', title: 'Books and binders',         desc: 'Donate books you\'ve finished. Toss binders with outdated content.' },
        { emoji: '📌', title: 'Sticky notes and reminders', desc: 'Clear old ones. Anything still relevant goes on a proper to-do list.' },
        { emoji: '🖨️', title: 'Printer area',             desc: 'Toss scrap paper, empty cartridges, and anything that accumulated here.' },
        { emoji: '💼', title: 'Office supplies',           desc: 'Consolidate duplicates. Toss dried-out pens and anything broken.' },
    ],
    'Entryway': [
        { emoji: '👟', title: 'Shoes by the door',         desc: 'Donate anything you haven\'t worn in a year. Keep only daily-use pairs here.' },
        { emoji: '🧥', title: 'Coats and jackets',         desc: 'If it\'s not the right season and you\'re not attached to it, donate it.' },
        { emoji: '🎒', title: 'Bags and backpacks',        desc: 'Empty one bag completely. Only put back what actually lives there.' },
        { emoji: '📬', title: 'Mail pile',                 desc: 'Toss junk mail, shred old statements, act on anything overdue.' },
        { emoji: '🗝️', title: 'Keys and hooks area',      desc: 'Clear anything that isn\'t a key or daily-carry item.' },
        { emoji: '🧤', title: 'Gloves, hats, scarves',    desc: 'If they\'re worn out or it\'s the wrong season, store or donate.' },
    ],
    'Laundry Room': [
        { emoji: '🧴', title: 'Old detergent bottles',     desc: 'Toss empty or near-empty duplicates. Consolidate to one of each.' },
        { emoji: '🧦', title: 'Mismatched socks',          desc: 'Give each sock 30 seconds to find its match. Orphans get tossed.' },
        { emoji: '🧺', title: 'Cleaning supplies stash',   desc: 'Toss empty bottles. Organize what\'s left by type.' },
        { emoji: '👔', title: 'Clothes without a home',    desc: 'Sort the pile of items that ended up here — return each to its proper place.' },
        { emoji: '🪣', title: 'Cleaning tools',            desc: 'Inspect mop heads, scrub brushes, and sponges. Replace anything past its prime.' },
    ],
    'Garage': [
        { emoji: '🔧', title: 'Tool corner',               desc: 'Return borrowed tools. Toss anything broken beyond repair.' },
        { emoji: '📦', title: 'Mystery boxes',             desc: 'Open one. Donate or toss anything you forgot you had.' },
        { emoji: '🏋️', title: 'Sports or fitness gear',   desc: 'Donate gear for sports you no longer play.' },
        { emoji: '🧹', title: 'Cleaning supplies',         desc: 'Consolidate duplicates. Toss empty or drying-out products.' },
        { emoji: '🚗', title: 'Car clutter',               desc: 'Clear out the car — trash, forgotten items, things that live elsewhere.' },
        { emoji: '🌱', title: 'Garden tools and supplies', desc: 'Toss dead plants, dry soil bags, broken tools.' },
    ],
};

const GENERIC_TASKS = [
    { emoji: '🚪', title: 'Entryway clutter',             desc: 'Grab everything that doesn\'t belong near the door and put it in its proper home.' },
    { emoji: '🛋️', title: 'Couch cushions',               desc: 'Pull out anything hiding in the cushions. Toss pillows you never use.' },
    { emoji: '📚', title: 'A bookshelf or stack',         desc: 'Donate or recycle anything you\'ve already read and won\'t revisit.' },
    { emoji: '🗂️', title: 'Paper pile',                   desc: 'Toss junk mail, shred old bills, file anything important.' },
    { emoji: '👗', title: 'One drawer of clothes',        desc: 'Pull it out, dump it, and only put back what you actually wear.' },
    { emoji: '🧴', title: 'Bathroom cabinet or counter',  desc: 'Toss anything expired, empty, or untouched in 6 months.' },
    { emoji: '🍱', title: 'Tupperware cabinet',            desc: 'Match lids to containers. Anything without a match goes.' },
    { emoji: '🧲', title: 'Junk drawer',                  desc: 'If you don\'t know what it is or haven\'t used it in a year, toss it.' },
    { emoji: '🧳', title: 'Under the bed',                desc: 'Pull everything out. Donate, toss, or store properly.' },
    { emoji: '🪴', title: 'A windowsill or shelf',        desc: 'Remove everything, dust, and only put back what you love or need.' },
    { emoji: '🖥️', title: 'Desk surface',                desc: 'Clear everything off. Only essentials come back on.' },
    { emoji: '🎮', title: 'Entertainment center',         desc: 'Wrangle cables, toss dead remotes, remove anything that drifted here.' },
    { emoji: '🧺', title: 'Laundry area',                 desc: 'Put away clean laundry, sort any piles, and clear the floor.' },
    { emoji: '🫙', title: 'Pantry shelf',                  desc: 'Check expiration dates. Donate unexpired food you won\'t use.' },
    { emoji: '👟', title: 'Shoe rack or closet floor',    desc: 'Donate anything unworn in a year. Pair everything up.' },
    { emoji: '🎒', title: 'Bags and backpacks',           desc: 'Empty one bag completely. Only put back what actually lives there.' },
    { emoji: '💊', title: 'Medicine cabinet',             desc: 'Check dates — discard expired meds properly.' },
    { emoji: '🧸', title: 'Decorative items',             desc: 'If it\'s just collecting dust and you\'re not attached, it goes.' },
    { emoji: '🔌', title: 'Cables and chargers',          desc: 'Identify every cable. Toss anything with no matching device.' },
    { emoji: '🧹', title: 'Cleaning supplies',            desc: 'Toss empty bottles. Organize what\'s left.' },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildTasks(roomName) {
    const pool = ROOM_TASKS[roomName] ?? GENERIC_TASKS;
    return shuffle(pool).slice(0, 5);
}

export default function Declutter() {
    const [phase, setPhase] = useState('pick'); // 'pick' | 'session' | 'done'
    const [room, setRoom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskIndex, setTaskIndex] = useState(0);
    const [doneCount, setDoneCount] = useState(0);

    function pickRoom(roomName) {
        const selected = roomName ?? ROOMS[Math.floor(Math.random() * ROOMS.length)].name;
        setRoom(selected);
        setTasks(buildTasks(selected));
        setTaskIndex(0);
        setDoneCount(0);
        setPhase('session');
    }

    function advance(completed) {
        if (completed) setDoneCount(n => n + 1);
        if (taskIndex + 1 >= tasks.length) {
            setPhase('done');
        } else {
            setTaskIndex(i => i + 1);
        }
    }

    function goAgain() {
        setPhase('pick');
        setRoom(null);
        setTasks([]);
        setTaskIndex(0);
        setDoneCount(0);
    }

    if (phase === 'pick') {
        return (
            <div className="declutter-page">
                <h2 className="page-title">Declutter Mode</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Pick a room and Tilly will walk you through 5 quick tasks.</p>
                <div className="declutter-room-grid">
                    {ROOMS.map(r => (
                        <button key={r.name} className="declutter-room-btn" onClick={() => pickRoom(r.name)}>
                            <span className="declutter-room-emoji">{r.emoji}</span>
                            {r.name}
                        </button>
                    ))}
                    <button className="declutter-room-btn" onClick={() => pickRoom(null)}>
                        <span className="declutter-room-emoji">🎲</span>
                        Surprise me
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'session') {
        const task = tasks[taskIndex];
        return (
            <div className="declutter-page">
                <h2 className="page-title">Declutter — {room}</h2>
                <p className="declutter-progress">Task {taskIndex + 1} of {tasks.length}</p>
                <div className="declutter-task-card">
                    <span className="declutter-task-emoji">{task.emoji}</span>
                    <span className="declutter-task-title">{task.title}</span>
                    <span className="declutter-task-desc">{task.desc}</span>
                    <div className="declutter-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => advance(true)}>Done ✓</button>
                        <button className="btn btn-sm" onClick={() => advance(false)}>Skip</button>
                    </div>
                </div>
            </div>
        );
    }

    // done phase
    let celebration;
    if (doneCount === 5) {
        celebration = 'You crushed it! 🌿 Every single task — done.';
    } else if (doneCount >= 3) {
        celebration = `Great session! 🌿 You tackled ${doneCount} out of 5 spots.`;
    } else if (doneCount >= 1) {
        celebration = `Good start! 🌿 You cleared ${doneCount} spot${doneCount === 1 ? '' : 's'}. Every bit counts.`;
    } else {
        celebration = "That's okay! 🌿 Showing up is half the battle.";
    }

    return (
        <div className="declutter-page">
            <h2 className="page-title">Declutter — {room}</h2>
            <div className="declutter-celebration">
                <span className="declutter-celebration-emoji">🌿</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{celebration}</p>
                <button className="btn btn-primary btn-sm" onClick={goAgain}>Go again</button>
            </div>
        </div>
    );
}
