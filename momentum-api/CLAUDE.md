# Momentum API — Backend Context

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
- Spring Security + JWT

## Architecture
Standard layered architecture:
- controller/ → REST API endpoints
- service/    → Business logic
- repository/ → Database queries (Spring Data JPA)
- entity/     → Database table models
- dto/        → Request and Response objects
- config/     → Configuration classes
- exception/  → Global error handling

## Database Tables
- users        → app users, credentials, settings
- tasks        → user tasks with priority, due date, recurrence
- daily_points → daily point tally per user
- streaks      → consistency streak per user
- badges       → badge catalogue
- user_badges  → badges earned by each user

## Current Status
- Auth layer complete: JWT, refresh tokens, soft delete, tests
- Next: task management endpoints
