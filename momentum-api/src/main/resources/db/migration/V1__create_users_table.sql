CREATE TABLE users (
    id                BIGSERIAL       PRIMARY KEY,
    email             VARCHAR(255)    NOT NULL UNIQUE,
    password_hash     VARCHAR(255)    NOT NULL,
    display_name      VARCHAR(100)    NOT NULL,
    lifetime_points   INT             NOT NULL DEFAULT 0,
    timezone          VARCHAR(50)     NOT NULL DEFAULT 'UTC',
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
