CREATE TABLE streaks (
    id                       BIGSERIAL    PRIMARY KEY,
    user_id                  BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak           INT          NOT NULL DEFAULT 0,
    longest_streak           INT          NOT NULL DEFAULT 0,
    streak_stage             VARCHAR(20)  NOT NULL DEFAULT 'BEGINNER'
                                          CHECK (streak_stage IN ('BEGINNER', 'BUILDING', 'HABIT', 'COMMITTED')),
    current_threshold        SMALLINT     NOT NULL DEFAULT 10,
    grace_days_used_this_week SMALLINT    NOT NULL DEFAULT 0,
    week_start_date          DATE,
    last_activity_date       DATE,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
