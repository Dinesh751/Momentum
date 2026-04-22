CREATE TABLE tasks (
    id               BIGSERIAL       PRIMARY KEY,
    user_id          BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            VARCHAR(255)    NOT NULL,
    description      TEXT,
    priority         VARCHAR(10)     NOT NULL DEFAULT 'NONE'
                                     CHECK (priority IN ('HIGH', 'MID', 'LOW', 'NONE')),
    points           SMALLINT        NOT NULL DEFAULT 0,
    due_date         DATE,
    is_completed     BOOLEAN         NOT NULL DEFAULT FALSE,
    completed_at     TIMESTAMPTZ,
    is_recurring     BOOLEAN         NOT NULL DEFAULT FALSE,
    recurrence_type  VARCHAR(20)     CHECK (recurrence_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    snoozed_until    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id       ON tasks(user_id);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
