const AFFILIATE_TAG = 'tidy-20'; // mock tag — swap for real one later

export function amazonUrl(asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

export const PRODUCTS = [
    // Surface / general
    { id:'p01', name:'Method All-Purpose Cleaner', description:'Plant-based formula, safe on counters, tile, and stovetops.', asin:'B00MOCK001', emoji:'🧴', tags:['counter','surface','kitchen','wipe','stovetop','all-purpose'] },
    { id:'p02', name:"Mrs. Meyer's Multi-Surface Spray", description:'Concentrated, plant-derived, great everyday clean.', asin:'B00MOCK002', emoji:'🌿', tags:['surface','all-purpose','counter','clean'] },
    { id:'p03', name:'Microfiber Cleaning Cloths (12-pack)', description:'Lint-free cloths that work wet or dry on any surface.', asin:'B00MOCK003', emoji:'🧻', tags:['wipe','dust','surface','clean','microfiber'] },
    { id:'p04', name:'Mr. Clean Magic Eraser', description:'Tackles scuffs, marks, and stubborn grime without harsh chemicals.', asin:'B00MOCK004', emoji:'🪄', tags:['scrub','stain','wall','surface','scuff'] },
    // Kitchen
    { id:'p05', name:"Bar Keepers Friend Powder", description:'Removes rust, mineral deposits, and burnt-on food from sinks and stovetops.', asin:'B00MOCK005', emoji:'🍳', tags:['kitchen','stovetop','stove','sink','pan','oven','scrub'] },
    { id:'p06', name:'Dawn Platinum Dish Soap', description:'Cuts through grease fast — works for dishes and kitchen surfaces.', asin:'B00MOCK006', emoji:'💧', tags:['dishes','kitchen','sink','dish','grease'] },
    { id:'p07', name:'Affresh Dishwasher Cleaner', description:'Dissolves limescale and grease inside your dishwasher.', asin:'B00MOCK007', emoji:'🫙', tags:['dishwasher','kitchen','appliance'] },
    { id:'p08', name:'Easy-Off Oven Cleaner', description:'Powerful foam that dissolves baked-on grease in the oven and on grates.', asin:'B00MOCK008', emoji:'🔥', tags:['oven','kitchen','stovetop','stove','grill'] },
    // Bathroom
    { id:'p09', name:'Scrubbing Bubbles Bathroom Cleaner', description:'Foaming formula removes soap scum and hard water stains fast.', asin:'B00MOCK009', emoji:'🫧', tags:['bathroom','shower','tub','bathtub','tile','soap scum'] },
    { id:'p10', name:'Lysol Toilet Bowl Cleaner', description:'Destroys 99.9% of bacteria under the rim and in the bowl.', asin:'B00MOCK010', emoji:'🚽', tags:['toilet','bathroom','bowl','scrub'] },
    { id:'p11', name:'Windex Original Glass Cleaner', description:'Streak-free shine on mirrors, windows, and glass surfaces.', asin:'B00MOCK011', emoji:'🪟', tags:['mirror','glass','window','bathroom','streak'] },
    { id:'p12', name:'CLR Calcium Lime Rust Remover', description:'Dissolves hard water deposits, calcium buildup, and rust stains.', asin:'B00MOCK012', emoji:'🚿', tags:['shower','faucet','hard water','calcium','rust','bathroom'] },
    // Floors
    { id:'p13', name:'Bona Hardwood Floor Cleaner', description:'Safe for finished hardwood — dries fast, no residue.', asin:'B00MOCK013', emoji:'🪵', tags:['floor','hardwood','mop','wood'] },
    { id:'p14', name:'Swiffer WetJet Starter Kit', description:'Mop and cleaning solution combo for quick, thorough floor cleaning.', asin:'B00MOCK014', emoji:'🧹', tags:['floor','mop','kitchen','sweep','swiffer'] },
    { id:'p15', name:'OXO Good Grips Microfiber Mop', description:'Reusable microfiber pad, adjustable handle, works on all hard floors.', asin:'B00MOCK015', emoji:'🧹', tags:['mop','floor','clean','hardwood','tile'] },
    // Laundry
    { id:'p16', name:'Tide PODS Laundry Detergent', description:'3-in-1 pacs: detergent, stain remover, and brightener in one.', asin:'B00MOCK016', emoji:'👕', tags:['laundry','wash','clothes','detergent','washer'] },
    { id:'p17', name:'Shout Advanced Stain Remover Spray', description:'Pretreats and lifts set-in stains before washing.', asin:'B00MOCK017', emoji:'🫧', tags:['stain','laundry','clothes','fabric','spot'] },
    { id:'p18', name:'OxiClean Versatile Stain Remover', description:'Oxygen-based powder boosts any detergent — great for whites and colors.', asin:'B00MOCK018', emoji:'✨', tags:['stain','laundry','white','bright','fabric','oxiclean'] },
    // Specialty
    { id:'p19', name:'Drano Max Gel Drain Clog Remover', description:'Thick gel clings to clogs and dissolves hair, grease, and soap.', asin:'B00MOCK019', emoji:'🕳️', tags:['drain','clog','sink','bathroom','shower','smell'] },
    { id:'p20', name:'Febreze Fabric Refresher', description:'Eliminates odors from fabrics, upholstery, and soft surfaces.', asin:'B00MOCK020', emoji:'🌸', tags:['smell','odor','fabric','couch','sofa','bedroom','refresh'] },
];

export function getProductsForQuery(query, n = 3) {
    const text = query.toLowerCase();
    return PRODUCTS
        .map(p => ({ p, score: p.tags.filter(t => text.includes(t)).length }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, n)
        .map(x => x.p);
}
