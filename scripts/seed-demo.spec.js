/**
 * Demo data seeder — creates 4 accounts on the deployed app with realistic data.
 *
 * Run once against the deployed app:
 *   npm run seed            (headless)
 *   npm run seed:headed     (watch it run)
 *
 * To target a different URL:
 *   BASE_URL=http://localhost:5173 npm run seed
 *
 * Demo accounts (password for all: TidyDemo1!)
 *   Casey Kim     casey@tidydemo.dev   — organized solo user, apartment
 *   Jordan Park   jordan@tidydemo.dev  — household owner, family house
 *   Taylor Park   taylor@tidydemo.dev  — joins Jordan's household
 *   Morgan Reyes  morgan@tidydemo.dev  — chaotic solo user, studio
 *
 * To clean up: delete these accounts from Firebase Console → Authentication.
 */

import { test } from '@playwright/test';

const PASSWORD = 'TidyDemo1!';

const USERS = {
    casey:  { name: 'Casey Kim',    email: 'casey@tidydemo.dev' },
    jordan: { name: 'Jordan Park',  email: 'jordan@tidydemo.dev' },
    taylor: { name: 'Taylor Park',  email: 'taylor@tidydemo.dev' },
    morgan: { name: 'Morgan Reyes', email: 'morgan@tidydemo.dev' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function register(page, { name, email }) {
    await page.goto('/register');
    await page.fill('#name', name);
    await page.fill('#email', email);
    await page.fill('#password', PASSWORD);
    await page.click('button:has-text("Create Account")');
    // New users with no profile are redirected to onboarding
    await page.waitForURL('**/onboarding', { timeout: 20_000 });
}

async function onboard(page, { homeType, bedrooms, bathrooms, laundryType, members, cleaningStyle, painPoints }) {
    // Each step uses a unique chip as a "ready" marker so we don't need
    // explicit sleeps — we just wait for a chip that only appears in that step.
    await page.waitForSelector('.ob-chip');

    // homeType (single-select, auto-advances)
    await page.click(`.ob-chip:has-text("${homeType}")`);
    await page.waitForSelector('.ob-chip:has-text("5+")'); // unique to bedrooms step

    // bedrooms (single-select)
    await page.locator('.ob-chip').filter({ hasText: new RegExp(`^${bedrooms}$`) }).click();
    await page.waitForSelector('.ob-chip:has-text("4+")'); // unique to bathrooms step

    // bathrooms (single-select)
    await page.locator('.ob-chip').filter({ hasText: new RegExp(`^${bathrooms}$`) }).click();
    await page.waitForSelector('.ob-chip:has-text("Laundromat")'); // unique to laundry step

    // laundryType (single-select)
    await page.click(`.ob-chip:has-text("${laundryType}")`);
    await page.waitForSelector('.ob-chip:has-text("Just me")'); // unique to householdMembers step

    // householdMembers (multi-select — requires Done button)
    for (const m of members) {
        await page.click(`.ob-chip:has-text("${m}")`);
    }
    await page.click('button:has-text("Done")');
    await page.waitForSelector('.ob-chip:has-text("Pretty on top of it")'); // unique to cleaningStyle step

    // cleaningStyle (single-select)
    await page.click(`.ob-chip:has-text("${cleaningStyle}")`);
    await page.waitForSelector('.ob-chip:has-text("Dishes piling up")'); // unique to painPoints step

    // painPoints (multi-select — requires Done button, up to 3)
    for (const p of painPoints) {
        await page.click(`.ob-chip:has-text("${p}")`);
    }
    await page.click('button:has-text("Done")');

    // Tilly fires a 2-second timeout before saving + navigating
    await page.waitForURL('**/dashboard/**', { timeout: 20_000 });
}

async function addChore(page, { name, frequency = 'Weekly', room = '' }) {
    await page.click('button:has-text("+ Add Chore")');
    await page.waitForSelector('.modal');
    await page.fill('input[placeholder="e.g. Vacuum living room"]', name);
    if (frequency !== 'Weekly') {
        await page.locator('.modal select').first().selectOption(frequency);
    }
    if (room) {
        await page.locator('.modal select').nth(1).selectOption(room);
    }
    await page.locator('.modal').getByRole('button', { name: 'Add Chore' }).click();
    await page.locator('.modal-overlay').waitFor({ state: 'detached', timeout: 8_000 });
}

async function completeChoreInRoom(page, typeName) {
    await page.goto('/dashboard/rooms');
    await page.waitForSelector('.room-card');
    await page.locator('.room-card', { hasText: typeName }).click();
    await page.waitForSelector('.room-chore-row');
    await page.locator('.room-chore-row').first().getByRole('button', { name: 'Complete' }).click();
    await page.waitForTimeout(600); // let the Firestore write land
}

async function createHousehold(page) {
    await page.goto('/dashboard/household');
    await page.waitForSelector('button:has-text("Create Household")');
    await page.click('button:has-text("Create Household")');
    await page.waitForSelector('.household-code-chip', { timeout: 10_000 });
    const code = await page.locator('.household-code-chip').textContent();
    return code?.trim() ?? '';
}

async function joinHousehold(page, code) {
    await page.goto('/dashboard/household');
    await page.waitForSelector('.household-code-input');
    await page.fill('.household-code-input', code.toUpperCase());
    await page.click('button:has-text("Join")');
    await page.waitForSelector('.household-member-list', { timeout: 10_000 });
}

// ── Seed ──────────────────────────────────────────────────────────────────────

test('seed demo data', async ({ browser }) => {

    // ── 1. Casey Kim — organized solo, apartment ──────────────────────────────
    console.log('\n👤 Casey Kim…');
    {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        await register(page, USERS.casey);
        await onboard(page, {
            homeType:      'Apartment',
            bedrooms:      2,
            bathrooms:     1,
            laundryType:   'In-unit',
            members:       ['Just me'],
            cleaningStyle: 'Weekly sweep',
            painPoints:    ['Dishes piling up', 'Vacuuming regularly'],
        });

        // Complete a couple chores so her dashboard shows activity
        await completeChoreInRoom(page, 'Kitchen');
        await completeChoreInRoom(page, 'Bedroom');

        await ctx.close();
        console.log('   ✅ done');
    }

    // ── 2. Jordan Park — household owner, family house ────────────────────────
    console.log('\n👤 Jordan Park…');
    let joinCode = '';
    {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        await register(page, USERS.jordan);
        await onboard(page, {
            homeType:      'House',
            bedrooms:      3,
            bathrooms:     2,
            laundryType:   'In-unit',
            members:       ['Partner', 'Kids'],
            cleaningStyle: 'Pretty on top of it',
            painPoints:    ['Bathroom scrubbing', 'Mopping floors', 'Cleaning the stovetop'],
        });

        joinCode = await createHousehold(page);
        console.log(`\n   🏠 Household join code: ${joinCode}\n`);

        // Add household chores (onboarding chores go to personal path;
        // these go to the shared household path after the household is created)
        await page.goto('/dashboard/chores');
        await addChore(page, { name: 'Wipe down baseboards',  frequency: 'Monthly',   room: 'Living Room' });
        await addChore(page, { name: 'Clean out the fridge',  frequency: 'Monthly',   room: 'Kitchen' });
        await addChore(page, { name: 'Wash windows',          frequency: 'Monthly',   room: 'Living Room' });
        await addChore(page, { name: 'Vacuum stairs',         frequency: 'Weekly',    room: 'Living Room' });
        await addChore(page, { name: 'Scrub master bathroom', frequency: 'Weekly',    room: 'Bathroom' });
        await addChore(page, { name: 'Empty all trash cans',  frequency: 'Weekly',    room: 'Kitchen' });

        await ctx.close();
        console.log('   ✅ done');
    }

    // ── 3. Taylor Park — joins Jordan's household ─────────────────────────────
    console.log('\n👤 Taylor Park…');
    {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        await register(page, USERS.taylor);
        await onboard(page, {
            homeType:      'Apartment',
            bedrooms:      1,
            bathrooms:     1,
            laundryType:   'Shared in building',
            members:       ['Just me'],
            cleaningStyle: 'Weekly sweep',
            painPoints:    ['Folding laundry'],
        });

        await joinHousehold(page, joinCode);

        await ctx.close();
        console.log('   ✅ done');
    }

    // ── 4. Morgan Reyes — chaotic solo, studio ────────────────────────────────
    console.log('\n👤 Morgan Reyes…');
    {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        await register(page, USERS.morgan);
        await onboard(page, {
            homeType:      'Studio',
            bedrooms:      1,
            bathrooms:     1,
            laundryType:   'Laundromat',
            members:       ['Just me'],
            cleaningStyle: "Honestly… it's chaos",
            painPoints:    ['Vacuuming regularly', 'Dusting shelves'],
        });

        await ctx.close();
        console.log('   ✅ done');
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n🌿 Demo data seeded!\n');
    console.log('Password for all accounts: TidyDemo1!\n');
    console.log('  Casey Kim     casey@tidydemo.dev   — solo, apartment, 2 bed');
    console.log('  Jordan Park   jordan@tidydemo.dev  — household owner, house, 3 bed');
    console.log(`  Taylor Park   taylor@tidydemo.dev  — joined Jordan's household (code: ${joinCode})`);
    console.log('  Morgan Reyes  morgan@tidydemo.dev  — solo, studio, chaotic\n');
});
