# Momentum API — Project Context

## What is Momentum
Momentum is a mobile-first gamified task management app. Users earn points by 
completing prioritised tasks each day and must meet a minimum daily point threshold 
to maintain their consistency streak. Badges and milestone rewards celebrate 
consistent performers.

## Tech Stack
- Java 17
- Spring Boot 4.0.5
- Maven
- PostgreSQL (installed locally, port 5432, database name: momentum)
- Spring Data JPA (Hibernate)
- Flyway migrations
- Lombok
- Validation (jakarta)
- Spring Boot DevTools
- Spring Security + JWT (to be added in Week 2)

## Architecture
Standard layered architecture:
- controller/ → REST API endpoints
- service/    → Business logic
- repository/ → Database queries (Spring Data JPA)
- entity/     → Database table models
- dto/        → Request and Response objects
- config/     → Configuration classes
- exception/  → Global error handling

## Database Tables (to be created via Flyway)
- users        → app users, credentials, settings
- tasks        → user tasks with priority, due date, recurrence
- daily_points → daily point tally per user
- streaks      → consistency streak per user
- badges       → badge catalogue
- user_badges  → badges earned by each user

## Priority Levels & Points
- HIGH   → 10 points
- MID    → 5 points
- LOW    → 2 points
- NONE   → 0 points

## Consistency Engine Rules
- Default daily threshold: 10 points
- Threshold met → +1 streak day
- Threshold not met → streak resets to 0
- No tasks added → grace day (max 1 per week)
- Consistency % = pointsEarned / Math.max(thresholdPts, totalPossiblePts) x 100

## Streak Stages & Auto Progression
- Beginner  → Day 1         → 10 pts threshold
- Building  → 7 day streak  → 15 pts threshold
- Habit     → 14 day streak → 20 pts threshold
- Committed → 30 day streak → 30 pts threshold

## Badge Catalogue
- First Step      → Complete first task
- On Fire         → 3 day streak
- Week Warrior    → 7 day streak
- Diamond Habit   → 30 day streak
- Century Club    → 100 day streak
- Sharpshooter    → 5 High priority tasks in one day
- Overachiever    → Earn 2x daily threshold in one day
- Perfect Week    → Meet threshold every day for 7 days
- Point Millionaire → 1000 lifetime points
- 10K Club        → 10000 lifetime points
- Clean Sweep     → Complete all tasks for a single day
- Early Bird      → Complete a task before 8 AM on 5 different days

## API Conventions
- All endpoints prefixed with /api/v1
- REST conventions (GET, POST, PUT, DELETE)
- JSON request and response
- JWT auth header: Authorization: Bearer <token>
- Standard response wrapper: { success, message, data }

## Current Status
- Week 1: Project setup phase
- Spring Boot project created and opened in IntelliJ
- PostgreSQL installed locally
- Next step: configure application.properties then create Flyway migrations

## Developer Notes
- This developer knows React but is new to React Native and Spring Boot
- Explain decisions clearly, don't just write code
- Follow industry best practices at all times
- No shortcuts — build it properly from the start
