
-- Phase B: Adopt classes as canonical, prune orphans, add FK
BEGIN;

-- 1. Delete orphan classes (no matching schedule)
DELETE FROM classes
WHERE id IN (
  SELECT c.id
  FROM classes c
  LEFT JOIN class_schedules cs ON cs.class_id = c.id
  WHERE cs.id IS NULL
);

-- 2. Add FK constraint to prevent future orphans
ALTER TABLE class_schedules
  ADD CONSTRAINT fk_class_schedules_class_id
  FOREIGN KEY (class_id) REFERENCES classes(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMIT;
