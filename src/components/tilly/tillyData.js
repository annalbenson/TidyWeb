// ── Stub replies ──────────────────────────────────────────────────────────────

export const STUBS = [
    { match: /stain/i,    reply: "For most fabric stains, blot (don't rub!) with cold water first. For tough stains like red wine, try club soda or a mix of dish soap and hydrogen peroxide." },
    { match: /bathroom/i, reply: "A good bathroom routine: wipe down the sink daily, scrub the toilet weekly, and deep clean the shower every 2 weeks. Keeping a squeegee in the shower helps a lot!" },
    { match: /kitchen/i,  reply: "Wipe counters after every use, sweep or Swiffer daily, and deep clean the stovetop weekly. The inside of the microwave gets gross fast — cover your food!" },
    { match: /routine/i,  reply: "Try a '10-minute daily reset': put things away, wipe surfaces, do a quick sweep. Weekly: bathrooms and floors. Monthly: deep clean one area at a time." },
    { match: /smell/i,    reply: "For mystery smells: check drains (baking soda + vinegar flush), trash cans (wash & dry them), and the fridge. Activated charcoal bags work great for closets." },
    { match: /mold/i,     reply: "For small mold spots, white vinegar in a spray bottle works well — spray, wait an hour, wipe. For larger areas or anything on drywall, it's worth calling a pro." },
];

export const FALLBACK = "Great question! I'm still learning more tips every day. In the meantime, your Tidy chore list is a great place to start — consistent small steps make the biggest difference. 🌿";

export const FOLLOW_UP = /^(tell me more|more|go on|what else|how|why|really|can you explain|what about|what if|and |but |thanks but|any other|elaborate|could you|is there|what do you mean)/i;

// ── Quick tasks ───────────────────────────────────────────────────────────────

export const QUICK_TASKS = [
    "Wipe down the microwave inside and out",
    "Clean the bathroom mirror and sink",
    "Empty and wipe out the trash can",
    "Wipe down the stovetop",
    "Vacuum one room",
    "Wipe down all light switches and door handles",
    "Declutter one drawer or shelf",
    "Sweep or Swiffer the kitchen floor",
    "Wipe down the outside of the fridge",
    "Clean the bathroom toilet",
    "Fold and put away any clean laundry",
    "Wipe down the bathroom counters",
    "Take out recycling",
    "Clean the inside of the microwave",
    "Dust one room",
];

// ── Room auto-assignment ──────────────────────────────────────────────────────

export const ROOM_RULES = [
    { room: 'Kitchen',      keywords: ['kitchen', 'counter', 'stovetop', 'stove', 'oven', 'microwave', 'fridge', 'refrigerator', 'dishes', 'dish'] },
    { room: 'Bathroom',     keywords: ['bathroom', 'toilet', 'shower', 'tub', 'bathtub'] },
    { room: 'Bedroom',      keywords: ['bedroom', 'bed', 'sheet', 'pillow', 'mattress'] },
    { room: 'Living Room',  keywords: ['living room', 'living', 'couch', 'sofa'] },
    { room: 'Office',       keywords: ['office', 'desk', 'workspace'] },
    { room: 'Entryway',     keywords: ['entryway', 'entrance', 'doormat', 'front door', 'mudroom'] },
    { room: 'Laundry Room', keywords: ['laundry', 'washer', 'dryer'] },
    { room: 'Garage',       keywords: ['garage', 'driveway'] },
];
