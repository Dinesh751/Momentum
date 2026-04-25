ALTER TABLE tasks ADD COLUMN recurring_group_id UUID;
CREATE INDEX idx_tasks_recurring_group_id ON tasks(recurring_group_id);
