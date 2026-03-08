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
- Mark complete (updates lastDone), delete

### Tilly
- Persistent input bar across the top of the dashboard
- Slide-open chat panel with message history
- Keyword-matched responses for common cleaning questions
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
  chores/{choreId}   — name, frequency, room?, lastDone?, createdAt
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
