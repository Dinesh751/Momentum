ALTER TABLE streaks
    ADD COLUMN threshold_miss_grace_used_this_week SMALLINT NOT NULL DEFAULT 0;
