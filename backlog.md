# TidyWeb Backlog

## v1 — Functional web companion

The basics: a logged-in user can manage their chore list from a browser, with data shared with the Android app.

- [x] Marketing home page
- [x] Firebase Auth — register, login, logout
- [x] Tilly onboarding chat (7-step, chips-only, 15 pain-point options pick 3, seeds starter chores + named rooms)
- [x] Dashboard shell — nav, sidebar, TillyBar, nested routes
- [x] Chores page — grid, filter tabs, add/complete/delete, overdue styling
- [x] Rooms page — By Type view (8 canonical rooms, completion ring, overdue badge) + By Name view (named room instances, add/delete, chore detail panel)
- [x] Profile page — view + edit the home profile Tilly collected; re-run onboarding
- [x] Deploy to Firebase Hosting

---

## v2 — Real Tilly, real chores

Make Tilly actually useful on web and close the gap with the Android feature set.

- [ ] Tilly Cloud Function — Gemini proxy so TillyBar gives real answers
- [ ] Personalized onboarding chore generation via Gemini (same prompt as Android release mode)
- [x] Chore edit — tap a card to open an edit modal (name, frequency, room)
- [x] Overdue sort — overdue chores float to top within each filter tab
- [x] Chore detail — last done date, completion count, next due date
- [x] Weekly Plan — 7-column scheduling board (Sun–Sat / Today→), drag-to-slot, unscheduled strip, Tilly voice scheduling

---

## v3 — Platform-native web

Features that make sense on web specifically, and fuller parity with Android.

- [ ] PWA — installable, offline shell
- [ ] Push notifications + daily digest — morning reminder listing overdue + due-today chores; browser push via Firebase Cloud Messaging; fallback email digest for users who decline push permission
- [x] Declutter mode — card-by-card session, room-aware (mirrors Android)
- [x] Room view — chores grouped by room with a per-room completion ring
- [ ] Google Calendar sync (app → GCal) — export scheduled chores from the Weekly Plan as Google Calendar events; uses OAuth write-only scope (no reading user's calendar); each chore gets a timed event at the slot's time block (Morning = 9am, Afternoon = 2pm, Evening = 7pm)

---

## Honey Do List

Nice-to-haves with no timeline.

- [x] Mobile web — responsive layout for phone browsers (bottom tab nav, stacked grids)
- [ ] House-wide chores — Vacuum, Mop, Dust and similar whole-home chores currently have no room; decide between adding a "Whole Home" room (fully integrated, shows in Rooms page + ring) vs. a "House-wide" badge on roomless cards (cosmetic only); update buildStarterChores and ROOM_NAMES accordingly
- [x] Shared households — invite a partner or roommate via 6-char join code; shared chore list, assignment dropdown with succulent avatars
- [ ] Stats — streaks, completion rate over time, busiest day of week
- [ ] Email digest — weekly summary of what got done and what's coming up
- [ ] Sync indicator — subtle badge showing data is live across Android + web
- [ ] Dark mode
- [ ] Chore templates — one-tap starter packs by home type (studio, house with kids, etc.)
- [x] Blog — public marketing content, no login required; cleaning tips + viral hack roundups; 3 launch posts; lives at /blog on the marketing site
- [ ] Product recommendations with affiliate links — Tilly (or a search field) suggests relevant cleaning products; links go to Amazon via affiliate tag; affiliate logic mocked with hardcoded product data initially, real API (Amazon PA API or similar) later; shown in-app on chore detail or as a Tilly suggestion
