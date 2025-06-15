
-- Add is_test column to webhook_logs table
ALTER TABLE public.webhook_logs 
ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- Back-fill existing rows with false (they were all production webhooks)
UPDATE public.webhook_logs 
SET is_test = false 
WHERE is_test IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.webhook_logs.is_test IS 'Indicates if this webhook was triggered by a test call vs production event';
