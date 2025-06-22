
-- Check for remaining duplicate foreign keys
SELECT conname
FROM pg_constraint
WHERE conrelid = 'class_schedules'::regclass
  AND confrelid = 'classes'::regclass;

-- If there are still duplicates, drop the old one
-- (This might not be needed if we already removed it, but just to be safe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'class_schedules_class_id_fkey'
          AND conrelid = 'class_schedules'::regclass
    ) THEN
        ALTER TABLE class_schedules DROP CONSTRAINT class_schedules_class_id_fkey;
    END IF;
END $$;
