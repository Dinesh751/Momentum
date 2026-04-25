# Momentum API — Backend Roadmap

## Phase 1 — Foundation ✅ Complete
- [x] Spring Boot project setup
- [x] PostgreSQL connection & configuration
- [x] Flyway migrations (users, tasks, daily_points, streaks, badges, user_badges)
- [x] Entity layer (JPA models)
- [x] Auth layer — register, login, logout
- [x] JWT access tokens + refresh tokens
- [x] Soft delete for users
- [x] Auth tests

---

## Phase 2 — Task Management ✅ Complete
- [x] `POST /api/v1/tasks` — create a task (title, priority, due date, optional recurrence)
- [x] `GET /api/v1/tasks` — list today's tasks for the authenticated user
- [x] `GET /api/v1/tasks?date=YYYY-MM-DD` — list tasks for a specific date
- [x] `PUT /api/v1/tasks/{id}` — edit a task
- [x] `DELETE /api/v1/tasks/{id}` — delete a task
- [x] `PATCH /api/v1/tasks/{id}/complete` — mark task as complete (triggers point award)
- [x] `PATCH /api/v1/tasks/{id}/uncomplete` — undo completion (revokes points)
- [x] Recurrence logic — auto-generate next occurrence when a recurring task is completed

---

## Phase 3 — Points & Daily Tracking ✅ Complete
- [x] Award points on task completion based on priority (HIGH=10, MID=5, LOW=2, NONE=0)
- [x] Revoke points on task uncompletion
- [x] `GET /api/v1/daily-points` — get today's point summary (earned, threshold, possible)
- [x] `GET /api/v1/daily-points?date=YYYY-MM-DD` — historical point summary
- [x] Consistency % calculation: `pointsEarned / Math.max(thresholdPts, totalPossiblePts) × 100`
- [ ] End-of-day job — evaluate whether threshold was met and trigger streak update (Phase 4)

---

## Phase 4 — Streak Engine ✅ Complete
- [x] Streak record creation on first task completion
- [x] `+1 streak` when daily threshold is met
- [x] `Streak resets to 0` when threshold is not met (and no grace day available)
- [x] Grace day logic — allow 1 no-task day per week without breaking streak
- [x] Auto-progression of streak stage and threshold:
  - Beginner (Day 1) → 10 pts
  - Building (Day 7) → 15 pts
  - Habit (Day 14) → 20 pts
  - Committed (Day 30) → 30 pts
- [x] `GET /api/v1/streaks` — current streak info (stage, days, threshold, grace days used)
- [x] End-of-day scheduler — runs at midnight, evaluates all users

---

## Phase 5 — Badge System ✅ Complete
- [x] Seed badge catalogue via Flyway migration (V5 — already seeded)
- [x] Badge award engine — evaluate badge conditions after relevant events:
  - First Step — first task completed
  - On Fire — 3 day streak
  - Week Warrior — 7 day streak
  - Diamond Habit — 30 day streak
  - Century Club — 100 day streak
  - Sharpshooter — 5 HIGH priority tasks completed in one day
  - Overachiever — earn 2× daily threshold in one day
  - Perfect Week — meet threshold every day for 7 consecutive days
  - Point Millionaire — 1000 lifetime points
  - 10K Club — 10000 lifetime points
  - Clean Sweep — all tasks completed for a given day
  - Early Bird — complete a task before 8 AM on 5 different days (uses user timezone)
- [x] Each badge awarded only once per user (idempotent)
- [x] `GET /api/v1/badges` — all badges with earned/unearned status for the user

---

## Phase 6 — User Profile & Settings ✅ Complete
- [x] `GET /api/v1/users/me` — fetch profile (name, email, join date, lifetime points)
- [x] `PUT /api/v1/users/me` — update display name
- [x] `PUT /api/v1/users/me/password` — change password (requires current password)
- [x] `DELETE /api/v1/users/me` — soft delete own account
- [x] Timezone support — store user timezone, use it for day boundary calculations

---

## Phase 7 — Stats & Analytics ✅ Complete
- [x] `GET /api/v1/stats/overview` — lifetime points, current streak, badges earned, consistency %
- [x] `GET /api/v1/stats/weekly` — last 7 days: points per day, threshold met/not met
- [x] `GET /api/v1/stats/monthly` — last 30 days summary
- [x] `GET /api/v1/stats/tasks` — total tasks created, completed, completion rate by priority

---

## Phase 8 — Production Readiness
- [ ] Swagger / OpenAPI documentation (`springdoc-openapi`)
- [ ] Global exception handler refinement (consistent error codes)
- [ ] Request validation error messages (field-level detail)
- [ ] Rate limiting (Spring Security or Bucket4j)
- [ ] Scheduled job reliability — handle missed end-of-day evaluations (e.g. server downtime)
- [ ] Integration test coverage for all major flows
- [ ] Environment-based config (dev / prod profiles)
- [ ] Docker + docker-compose setup for local dev
- [ ] README with setup instructions

---

## Dependency Order
```
Phase 1 (Done)
    └── Phase 2 (Tasks)
            └── Phase 3 (Points)
                    └── Phase 4 (Streaks)
                            └── Phase 5 (Badges)
Phase 6 can run in parallel after Phase 1
Phase 7 depends on Phases 3–5
Phase 8 runs last
```
