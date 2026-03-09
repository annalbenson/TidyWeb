export const POSTS = [
    {
        slug: '10-minute-reset',
        title: 'The 10-Minute Reset: How to Make Your Home Feel Clean Fast',
        category: 'Tip Roundup',
        date: 'March 2026',
        excerpt: 'No time for a deep clean? A focused 10-minute reset can transform the feel of your home without breaking a sweat. Here\'s exactly how to do it.',
        sections: [
            {
                heading: 'Start With the Counters and Surfaces',
                body: 'The fastest way to make a space feel clean is to clear the clutter. Grab a damp cloth and make one pass across every visible surface — kitchen counters, coffee table, bathroom sink. Don\'t reorganize, just clear and wipe. You\'ll be amazed how much better a room looks when there\'s nothing on the counters.',
            },
            {
                heading: 'Do a 2-Minute Floor Pass',
                body: 'You don\'t need to mop or deep vacuum. Grab your broom or Swiffer and sweep the kitchen and bathroom floors. These two rooms make the biggest impression when they\'re clean. A quick pass takes under two minutes and removes the crumbs and dust that collect daily.',
            },
            {
                heading: 'The Final Sweep: Fluff, Toss, and Done',
                body: 'Spend the last few minutes on the "finishing touches" that trick your brain into thinking the whole house is clean: fluff the couch cushions, toss any stray items into a basket or drawer, and close any open cabinet doors. Light a candle or open a window if you have a minute to spare. Your home won\'t be deep-cleaned, but it will feel reset — and that matters.',
            },
        ],
    },
    {
        slug: 'tiktok-cleaning-hacks',
        title: 'We Tried 5 Viral TikTok Cleaning Hacks So You Don\'t Have To',
        category: 'Hack Review',
        date: 'March 2026',
        excerpt: 'TikTok is full of "life-changing" cleaning hacks that promise to do in 30 seconds what normally takes an hour. We tested the top five so you know which ones are actually worth trying.',
        sections: [
            {
                heading: 'Baking Soda on Grout',
                body: 'The claim: sprinkle baking soda on grout, scrub with an old toothbrush, and watch years of grime vanish. The reality: it works, but it takes elbow grease. The baking soda acts as a mild abrasive, and the results are genuinely satisfying on light buildup. For heavily stained grout, combine it with a little dish soap or hydrogen peroxide. Verdict: ✅ real, worth trying.',
            },
            {
                heading: 'Dishwasher Tablet on Oven Door',
                body: 'The claim: wet a dishwasher tablet and scrub the glass oven door in circles to dissolve baked-on grease like magic. The reality: this one is legitimately impressive. The enzymes in dishwasher tablets cut through grease in a way that most sprays don\'t. It takes about 5 minutes and the results look professional. Verdict: ✅ absolutely real, one of the best hacks we tested.',
            },
            {
                heading: 'Vinegar in the Microwave',
                body: 'The claim: microwave a bowl of water and white vinegar for 5 minutes, then wipe clean effortlessly. The reality: the steam does loosen stuck-on food, but you still need a cloth and a little pressure. It\'s faster than scrubbing dry, and the vinegar neutralizes odors as a bonus. Verdict: ✅ works, especially for microwaves you haven\'t cleaned in a while.',
            },
            {
                heading: 'Dryer Sheet on Baseboards',
                body: 'The claim: wipe baseboards with a dryer sheet to clean them and repel future dust. The reality: the cleaning part is just okay — a damp cloth works better for actual grime. But the anti-static coating does seem to slow dust buildup for a week or two. Great for maintenance, not for a first pass on dusty baseboards. Verdict: 🟡 partially real — better as a follow-up than a first clean.',
            },
            {
                heading: 'Pumice Stone on Toilet Ring',
                body: 'The claim: wet a pumice stone and scrub away rust and mineral rings from inside the toilet bowl. The reality: this is the real deal. Pumice is soft enough not to scratch porcelain (as long as both the stone and the surface are wet) and removes hard water stains that cleaners alone can\'t touch. Keep the stone submerged while scrubbing. Verdict: ✅ one of the most effective cleaning tools we\'ve tried.',
            },
        ],
    },
    {
        slug: 'spring-cleaning-checklist',
        title: 'Spring Cleaning Room by Room: The Only Checklist You Need',
        category: 'Seasonal',
        date: 'March 2026',
        excerpt: 'Spring cleaning doesn\'t have to be overwhelming. Work through your home room by room with this focused checklist and you\'ll be done in a weekend.',
        sections: [
            {
                heading: 'Kitchen',
                body: 'Empty and wipe down every cabinet shelf. Clean the inside of the oven and microwave. Pull out the fridge and sweep underneath. Descale the kettle and coffee maker. Wipe down the hood vent and replace the filter if needed. Clear out expired pantry items. Scrub the grout on the backsplash. Once the kitchen is done, the rest of the house feels manageable.',
            },
            {
                heading: 'Bathroom',
                body: 'Deep scrub the toilet, including under the rim and around the base. Remove the shower curtain and wash it (most are machine washable). Scrub tile grout and caulk — replace caulk if it\'s discolored or peeling. Clean the exhaust fan cover (dust buildup reduces efficiency). Toss anything expired from the medicine cabinet. Wash the bathroom rug and bath mat.',
            },
            {
                heading: 'Bedroom',
                body: 'Flip or rotate the mattress. Wash pillows, duvets, and comforters according to their care labels. Vacuum under the bed (this is where a shocking amount of dust lives). Wipe down the headboard, nightstands, and any upholstered furniture. Declutter the closet — if you haven\'t worn it in a year, consider donating it. Clean window sills and the tops of door frames.',
            },
            {
                heading: 'Living Room',
                body: 'Move furniture and vacuum underneath. Wipe down the TV screen and all electronics with a dry microfiber cloth. Clean throw pillows and blankets. Dust ceiling fan blades — they accumulate more than you\'d expect. Wipe down baseboards and window sills. If you have blinds, wipe each slat individually with a damp cloth or duster.',
            },
            {
                heading: 'Final Thoughts',
                body: 'The goal of spring cleaning isn\'t perfection — it\'s a reset. Work through one room per day if that\'s more sustainable than a full weekend blitz. Once you\'re done, setting up a weekly maintenance routine (like the one Tidy helps you track) keeps the buildup from coming back. Clean once, maintain forever.',
            },
        ],
    },
];

export function getPost(slug) {
    return POSTS.find(p => p.slug === slug);
}
