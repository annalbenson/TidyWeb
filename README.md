# TidyWeb

The web companion to **Tidy** for Android. Your chore list and Tilly chat, available from any browser — data shared across both platforms via Firebase.

---

## Features

### Onboarding
- Chat-driven setup with Tilly: home type, bedrooms, bathrooms, laundry situation, household members, cleaning style, pain points
- Starter chore list seeded on completion (personalized Gemini generation coming in v2)
- Skipped automatically on return visits

### Chores
- Chore grid with filter tabs: All · Overdue · Due today · Upcoming
- Overdue chores highlighted in terracotta; due-today in teal
- Add chore with name, frequency (Daily / Weekly / Biweekly / Monthly), and optional room
- Mark complete (updates lastDone, increments completionCount), delete
- Edit modal shows chore detail strip: last done date, next due date, completion count

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
- Responsive layout at ≤768px: sidebar replaced by a fixed bottom tab bar (Chores · Rooms · Plan · Profile)
- Grids, modals, and padding adapt for phone screen sizes

### Tilly
- Persistent input bar across the top of the dashboard
- Slide-open chat panel with message history
- Keyword-matched responses for common cleaning questions
- Auto-assigns rooms to chores by keyword ("assign rooms to my chores")
- Schedules chores by natural language ("put dishes in the evening", "unschedule laundry")
- Full Gemini integration planned for v2 via Cloud Function proxy

---

## Tech

- **Framework:** React 19 + React Router 7
- **Backend:** Firebase Auth (email/password) + Firestore (per-user subcollections)
- **Build:** Vite 7
- **Hosting:** Firebase Hosting

---

## Firestore structure

```
users/{uid}
  profile/home       — homeType, bedrooms, bathrooms, laundryType,
                       householdMembers, cleaningStyle, painPoints
  chores/{choreId}   — name, frequency, room?, lastDone?, completionCount?, createdAt,
                       scheduledDate? ('YYYY-MM-DD' | 'daily' | null), scheduledTime? ('morning'|'afternoon'|'evening'|null)
  rooms/{roomId}     — (v2)
```

---

## Dev setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run deploy     # vite build + firebase deploy
```

---

## Android app

The Tidy Android app (Java, SQLite, Gemini 2.0 Flash) lives in the `ChoreTracker` repo. Onboarding flow, chore model, frequencies, and Tilly personality are designed to match across both platforms.

See [`backlog.md`](./backlog.md) for the roadmap.
