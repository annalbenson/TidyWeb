# TidyWeb

Web companion for the **Tidy** Android chore tracker app. Built with React 19 + Firebase (Auth + Firestore) + Vite.

## Stack

- **React 19** + React Router 7
- **Firebase** — Auth (email/password) + Firestore (per-user data)
- **Vite 7** — dev server + build
- Deployed to **Firebase Hosting**

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run deploy     # build + firebase deploy
```

## Auth flow

- Register → Onboarding chat → Dashboard
- Login → Dashboard (or Onboarding if profile missing)
- All data scoped to `users/{uid}/` in Firestore

## Onboarding (Tilly chat)

New users go through a 7-step guided setup with Tilly:

1. Home type (apartment, house, condo…)
2. Bedrooms
3. Bathrooms
4. Laundry situation (chips)
5. Household members (multi-select chips)
6. Cleaning style (chips)
7. Pain points (text)

Profile saved to `users/{uid}/profile/home`. 12 default chores seeded to `users/{uid}/chores` on completion.

## Dashboard

Nested routes under `/dashboard`:

| Route | Page |
|---|---|
| `/dashboard/chores` | Chore grid with filter tabs, add/complete/delete |
| `/dashboard/rooms` | Placeholder |
| `/dashboard/profile` | Placeholder |

**TillyBar** — persistent AI input strip across the top of the dashboard. Keyword-matched stub replies (Gemini Cloud Function proxy is a future step).

## Firestore structure

```
users/{uid}
  profile/home       — HomeProfile doc
  chores/{choreId}   — name, frequency, room?, lastDone?, createdAt
  rooms/{roomId}     — (future)
```

## Color palette

| Variable | Value | Use |
|---|---|---|
| `--primary` | `#6B9E8A` | Sage green — nav, buttons |
| `--accent` | `#78C4C0` | Dusty teal — due today |
| `--terracotta` | `#C07850` | Overdue indicator |
| `--bg` | `#F5F2EC` | Warm cream background |
