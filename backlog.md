# TidyWeb Backlog

## v1 — Functional web companion

The basics: a logged-in user can manage their chore list from a browser, with data shared with the Android app.

- [x] Marketing home page
- [x] Firebase Auth — register, login, logout
- [x] Tilly onboarding chat (7-step, chips + text input, seeds starter chores)
- [x] Dashboard shell — nav, sidebar, TillyBar, nested routes
- [x] Chores page — grid, filter tabs, add/complete/delete, overdue styling
- [ ] Rooms page — create rooms, assign chores to them, filter grid by room
- [ ] Profile page — view + edit the home profile Tilly collected; re-run onboarding
- [ ] Deploy to Firebase Hosting

---

## v2 — Real Tilly, real chores

Make Tilly actually useful on web and close the gap with the Android feature set.

- [ ] Tilly Cloud Function — Gemini proxy so TillyBar gives real answers
- [ ] Personalized onboarding chore generation via Gemini (same prompt as Android release mode)
- [ ] Chore edit — tap a card to open an edit modal (name, frequency, room)
- [ ] Overdue sort — overdue chores float to top within each filter tab
- [ ] Chore detail — last done date, completion count, next due date

---

## v3 — Platform-native web

Features that make sense on web specifically, and fuller parity with Android.

- [ ] PWA — installable, offline shell
- [ ] Web push notifications — daily digest of overdue + due-today chores
- [ ] Declutter mode — card-by-card session, room-aware (mirrors Android)
- [ ] Room view — chores grouped by room with a per-room completion ring

---

## Honey Do List

Nice-to-haves with no timeline.

- [ ] Shared households — invite a partner or roommate, shared chore list
- [ ] Stats — streaks, completion rate over time, busiest day of week
- [ ] Email digest — weekly summary of what got done and what's coming up
- [ ] Sync indicator — subtle badge showing data is live across Android + web
- [ ] Dark mode
- [ ] Chore templates — one-tap starter packs by home type (studio, house with kids, etc.)
