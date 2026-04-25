ALTER TABLE tasks
    DROP COLUMN recurrence_type,
    ADD COLUMN recurring_days VARCHAR(100);
