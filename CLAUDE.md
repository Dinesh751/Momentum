# Momentum — Shared Project Context

## What is Momentum
Momentum is a mobile-first gamified task management app. Users earn points by
completing prioritised tasks each day and must meet a minimum daily point threshold
to maintain their consistency streak. Badges and milestone rewards celebrate
consistent performers.

## Repositories
- `momentum-api/`      → Spring Boot REST API (Java 17)
- `momentum-frontend/` → React Native mobile app (to be created)

## Priority Levels & Points
- HIGH   → 10 points
- MID    → 5 points
- LOW    → 2 points
- NONE   → 0 points

## Consistency Engine Rules
- Default daily threshold: 10 points
- Threshold met → +1 streak day
- Threshold not met → streak resets to 0
- No tasks added → grace day (max 2 per week)
- Consistency % = pointsEarned / Math.max(thresholdPts, totalPossiblePts) x 100

## Streak Stages & Auto Progression
- Beginner  → Day 1         → 10 pts threshold
- Building  → 7 day streak  → 12 pts threshold
- Habit     → 14 day streak → 15 pts threshold
- Committed → 30 day streak → 20 pts threshold

## Badge Catalogue
- First Step        → Complete first task
- On Fire           → 3 day streak
- Week Warrior      → 7 day streak
- Diamond Habit     → 30 day streak
- Century Club      → 100 day streak
- Sharpshooter      → 5 High priority tasks in one day
- Overachiever      → Earn 2x daily threshold in one day
- Perfect Week      → Meet threshold every day for 7 days
- Point Millionaire → 1000 lifetime points
- 10K Club          → 10000 lifetime points
- Clean Sweep       → Complete all tasks for a single day
- Early Bird        → Complete a task before 8 AM on 5 different days

## API Conventions
- All endpoints prefixed with /api/v1
- REST conventions (GET, POST, PUT, DELETE)
- JSON request and response
- JWT auth header: Authorization: Bearer <token>
- Standard response wrapper: { success, message, data }

## Developer Notes
- This developer knows React but is new to React Native and Spring Boot
- Explain decisions clearly, don't just write code
- Follow industry best practices at all times
- No shortcuts — build it properly from the start
