# TidyWeb

The web companion to **Tidy** for Android. Your chore list and Tilly chat, available from any browser — data shared across both platforms via Firebase.

---

## Features

### Onboarding
- Chat-driven setup with Tilly: home type, bedrooms, bathrooms, laundry situation, household members, cleaning style, pain points
- Every step uses chip buttons — no free-text input; pain points step offers 15 options, pick up to 3
- Starter chore list **and named room instances** seeded on completion: 2 bedrooms → "Bedroom 1" + "Bedroom 2" rooms created automatically
- Skipped automatically on return visits

### Chores
- Chore grid with filter tabs: All · Overdue · Due today · Upcoming
- Overdue chores highlighted in terracotta; due-today in teal
- Add chore with name, frequency (Daily / Weekly / Biweekly / Monthly / **As needed**), and optional room
- "As needed" chores never go overdue — labeled "No schedule", only visible under All tab, never appear in Plan strip
- Mark complete (updates lastDone, increments completionCount), delete
- Edit modal shows chore detail strip: last done date, next due date, completion count
- **Swipe gestures on mobile (touch devices):** swipe right → complete (green), swipe left → delete (terracotta); short swipe snaps back
- **Assignment:** in a household, assign any chore to a member; custom dropdown shows each member's succulent avatar; assignee badge (with avatar) shown on the chore card

### Rooms
- **By Type view** (default): 8 canonical room cards (Kitchen, Bathroom, Bedroom, …); chore count and overdue badge per room; click to expand chore detail with Complete buttons
- **By Name view**: user-created named rooms (e.g. "Master Bathroom", "Anna's Bedroom"); add/rename/remove named rooms; each named room links to the chores assigned to it by name
- Named rooms created during onboarding (from bedroom/bathroom count) automatically appear here
- **Rename:** inline edit in the detail panel header; cascades the new name to all chores in that room so linkage stays intact
- Completion ring SVG on each card; overdue chores shown in terracotta badge

### Household
- Create a shared household — generates a 6-character join code (no email required)
- Any member can join with the code; both accounts then read/write the same chore list
- Household chores stored at `households/{id}/chores` — solo users continue using `users/{uid}/chores` unchanged
- Members list shows each member with their **succulent avatar** (deterministic, hash-based) and a "you" indicator
- Join code copyable to clipboard
- Leave household at any time — your chores revert to the solo path; other members' data is unaffected

### Weekly Plan
- Day-based scheduling board: 7 day columns (Sun–Sat) × 3 time slot rows (Morning / Afternoon / Evening)
- Toggle between **Sun–Sat** fixed week view and **Today →** rolling 7-day view; preference persisted to localStorage
- Unscheduled strip: horizontal chip row showing chores due within 7 days that haven't been slotted yet
- Drag chip into a time slot to schedule; drag card back to strip to unschedule; drag between slots to reschedule
- Daily chores (e.g. Dishes) scheduled to a slot appear across all 7 day columns; pinned to top within each slot
- Today's column highlighted in green
- Complete button on each card dims it in place (doesn't remove from schedule)
- Tilly can schedule chores by voice: "put dishes in the evening" or "unschedule laundry"

### Mobile Web
- Responsive layout at ≤768px: sidebar replaced by a fixed bottom tab bar (Chores · Rooms · Plan · Profile · Declutter)
- Grids, modals, and padding adapt for phone screen sizes
- Plan board fills the full viewport on mobile; columns sized to show 3 days at a time with horizontal scroll

### Tilly
- Persistent input bar across the top of the dashboard
- Slide-open chat panel with message history
- Keyword-matched responses for common cleaning questions
- Auto-assigns rooms to chores by keyword ("assign rooms to my chores")
- Schedules chores by natural language ("put dishes in the evening", "unschedule laundry")
- **Quick tasks:** "give me a quick task" → random 5-minute cleaning task from a curated list of 15
- **Daily plan:** "make me a plan for today" → personalized plan based on cleaning style from profile
- **Reonboard:** "start over" or **"I moved"** → confirmation flow that clears all chores, named rooms, and profile and restarts onboarding; "I moved" variant opens with a warm congratulations message
- **Declutter nav:** "let's declutter" → navigates to Declutter mode
- **Product recommendations:** keyword-matched cleaning product suggestions with Amazon buy buttons; up to 3 products shown inline with relevant Tilly replies; explicit prompts ("what should I use for my bathroom?", "recommend a cleaner") also trigger recommendations; 20-product catalog with mock ASINs, swap `AFFILIATE_TAG` in `src/data/products.js` for real tag
- Full Gemini integration planned for v2 via Cloud Function proxy

---

## Tech

- **Framework:** React 19 + React Router 7
- **Backend:** Firebase Auth (email/password) + Firestore (per-user subcollections + shared household subcollections)
- **Build:** Vite 7
- **Hosting:** Firebase Hosting

---

## Firestore structure

```
users/{uid}
  householdId        — string | null (set on create/join, cleared on leave)
  profile/home       — homeType, bedrooms, bathrooms, laundryType,
                       householdMembers, cleaningStyle, painPoints
  chores/{choreId}   — solo path (used when householdId is null)
  rooms/{roomId}     — name, type, createdAt  (named room instances)

households/{householdId}
  joinCode           — 6-char alphanumeric (A-Z2-9, no 0/O/1/I)
  createdBy          — uid
  members            — map of { [uid]: { name } }
  chores/{choreId}   — name, frequency, room?, lastDone?, completionCount?, createdAt,
                       scheduledDate?, scheduledTime?, assignedTo? (uid | null)
```

---

## Dev setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run deploy     # vite build + firebase deploy
npm test           # vitest run (single pass)
npm run test:watch # vitest watch mode
```

## Testing

- **Framework:** Vitest + @testing-library/react
- 247 tests across 13 test files
- ~57% overall statement coverage; 100% on pure logic (posts, chores utils, errors, Declutter)
- All Firebase/API calls are mocked — tests cover UI behavior and logic only
- `src/test-setup.js` — global jsdom shims (matchMedia, scrollIntoView)
- `test-writer` agent in `.claude/agents/` — invoke after writing new features to auto-generate tests

## Demo data seeding

Playwright script that drives the real deployed app to create 4 realistic demo accounts:

```bash
npm run seed:install   # install Chromium (one-time)
npm run seed           # run headless against deployed app
npm run seed:headed    # watch it run
BASE_URL=http://localhost:5173 npm run seed   # target local dev server
```

**Demo accounts** (password: `TidyDemo1!`):

| Account | Profile |
|---|---|
| `casey@tidydemo.dev` | Apartment, 2 bed, organized solo — has completed chores |
| `jordan@tidydemo.dev` | House, 3 bed/2 bath, family — creates household, adds shared chores |
| `taylor@tidydemo.dev` | Apartment, 1 bed — joins Jordan's household |
| `morgan@tidydemo.dev` | Studio, laundromat, chaotic solo |

To clean up: delete accounts from Firebase Console → Authentication.

---

## Android app

The Tidy Android app (Java, SQLite, Gemini 2.0 Flash) lives in the `ChoreTracker` repo. Onboarding flow, chore model, frequencies, and Tilly personality are designed to match across both platforms.

See [`backlog.md`](./backlog.md) for the roadmap.

---

### Blog (`/blog`)
- Public-facing blog, no login required
- Post listing at `/blog`: 3-column card grid (2-col tablet, 1-col mobile) with colored banners by category
- Categories: Tip Roundup (sage), Hack Review (teal), Seasonal (terracotta)
- Individual posts at `/blog/:slug`: centered single-column reading view, serif title, section headings
- 3 launch posts: "The 10-Minute Reset", "We Tried 5 Viral TikTok Cleaning Hacks", "Spring Cleaning Room by Room"
- Post data hardcoded in `src/data/posts.js`; CMS migration planned for v2
- "Blog" link added to marketing nav

### Declutter Mode

- Room picker: 8 rooms + "Surprise me" (random)
- 5 random tasks per session drawn from room-specific pools (ported verbatim from Android's DeclutterActivity)
- Task card: emoji, title, description — Done or Skip each one
- Celebration screen at the end scaled to how many tasks were completed
- Accessible from sidebar, bottom nav, and Tilly chat
