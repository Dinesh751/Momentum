CREATE TABLE daily_points (
    id                  BIGSERIAL   PRIMARY KEY,
    user_id             BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date                DATE        NOT NULL,
    points_earned       SMALLINT    NOT NULL DEFAULT 0,
    threshold_pts       SMALLINT    NOT NULL,
    total_possible_pts  SMALLINT    NOT NULL DEFAULT 0,
    threshold_met       BOOLEAN     NOT NULL DEFAULT FALSE,
    is_grace_day        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, date)
);

CREATE INDEX idx_daily_points_user_date ON daily_points(user_id, date);
