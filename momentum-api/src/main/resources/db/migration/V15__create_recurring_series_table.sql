CREATE TABLE recurring_series (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            UUID         NOT NULL UNIQUE,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    priority            VARCHAR(20)  NOT NULL DEFAULT 'NONE',
    recurring_days      VARCHAR(100) NOT NULL,
    start_date          DATE         NOT NULL,
    end_date            DATE         NOT NULL,
    materialized_through DATE        NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_series_group_id ON recurring_series(group_id);
CREATE INDEX idx_recurring_series_user_id  ON recurring_series(user_id);
CREATE INDEX idx_recurring_series_end_date ON recurring_series(end_date);
