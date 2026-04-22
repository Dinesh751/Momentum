-- daily_points
ALTER TABLE daily_points ALTER COLUMN points_earned      TYPE INTEGER;
ALTER TABLE daily_points ALTER COLUMN threshold_pts      TYPE INTEGER;
ALTER TABLE daily_points ALTER COLUMN total_possible_pts TYPE INTEGER;

-- streaks
ALTER TABLE streaks ALTER COLUMN current_threshold        TYPE INTEGER;
ALTER TABLE streaks ALTER COLUMN grace_days_used_this_week TYPE INTEGER;

-- tasks
ALTER TABLE tasks ALTER COLUMN points TYPE INTEGER;
