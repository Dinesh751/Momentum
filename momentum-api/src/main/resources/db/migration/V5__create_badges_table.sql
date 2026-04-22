CREATE TABLE badges (
    id          BIGSERIAL       PRIMARY KEY,
    code        VARCHAR(50)     NOT NULL UNIQUE,
    name        VARCHAR(100)    NOT NULL,
    description TEXT            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

INSERT INTO badges (code, name, description) VALUES
    ('FIRST_STEP',       'First Step',       'Complete your first task'),
    ('ON_FIRE',          'On Fire',           'Achieve a 3 day streak'),
    ('WEEK_WARRIOR',     'Week Warrior',      'Achieve a 7 day streak'),
    ('DIAMOND_HABIT',    'Diamond Habit',     'Achieve a 30 day streak'),
    ('CENTURY_CLUB',     'Century Club',      'Achieve a 100 day streak'),
    ('SHARPSHOOTER',     'Sharpshooter',      'Complete 5 High priority tasks in one day'),
    ('OVERACHIEVER',     'Overachiever',      'Earn 2x daily threshold in one day'),
    ('PERFECT_WEEK',     'Perfect Week',      'Meet threshold every day for 7 days'),
    ('POINT_MILLIONAIRE','Point Millionaire', 'Earn 1000 lifetime points'),
    ('10K_CLUB',         '10K Club',          'Earn 10000 lifetime points'),
    ('CLEAN_SWEEP',      'Clean Sweep',       'Complete all tasks for a single day'),
    ('EARLY_BIRD',       'Early Bird',        'Complete a task before 8 AM on 5 different days');
