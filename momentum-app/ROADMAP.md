# Momentum App — Frontend Roadmap

## Phase 1 — Foundation
- [x] Folder structure — `app/`, `components/`, `store/`, `services/`, `types/`, `hooks/`, `constants/`
- [x] Navigation setup — root stack with `AuthStack` (Login, Register) and `AppTabs` (Dashboard, Tasks, Streaks, Badges)
- [x] Auth screens — Login + Register UI wired to the API
- [x] Auth store (Zustand) — store JWT tokens, handle login/logout, persist to AsyncStorage
- [x] Axios instance — base URL, attach Bearer token on every request, auto-refresh on 401


## Phase 2 — Core Features
- [x] Tasks — list today's tasks, add/complete/delete a task, carry-over, move to tomorrow, day navigation
- [x] Dashboard — daily points summary, progress bar toward threshold, tasks summary, streak + badge cards
- [x] Streaks — current streak, stage progression, longest streak, grace days, last active date
- [x] Badges — full catalogue grid, earned vs locked states, unlock dates, summary card
- [x] Daily Points API — threshold driven by streak stage (not hardcoded), reloads on date change

## Phase 3 — Polish
- [ ] Loading states and error handling across all screens
- [ ] Empty states (no tasks added yet, no badges earned yet)
- [ ] Animations and transitions (streak milestone, badge unlock)
- [ ] Offline handling — graceful degradation when API is unreachable
