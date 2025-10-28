-- Fix image aspect ratio logic
-- Remove aspect_ratio column, add original dimensions, default to contain

-- Add original dimensions columns
ALTER TABLE post_images 
  ADD COLUMN IF NOT EXISTS original_width INTEGER,
  ADD COLUMN IF NOT EXISTS original_height INTEGER;

-- Change default fit_mode to 'contain'
ALTER TABLE post_images 
  ALTER COLUMN fit_mode SET DEFAULT 'contain';

-- Migrate existing posts to 'contain' mode if not set
UPDATE post_images 
SET fit_mode = 'contain' 
WHERE fit_mode IS NULL;

-- Drop aspect_ratio column (no longer needed - calculate from dimensions)
ALTER TABLE post_images 
  DROP COLUMN IF EXISTS aspect_ratio;