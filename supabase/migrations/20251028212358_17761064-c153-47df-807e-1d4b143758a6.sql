-- Add image fit mode and aspect ratio fields to post_images table
ALTER TABLE post_images 
ADD COLUMN IF NOT EXISTS fit_mode TEXT DEFAULT 'cover' CHECK (fit_mode IN ('cover', 'contain')),
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '16:9' CHECK (aspect_ratio IN ('1:1', '4:5', '16:9', '21:9')),
ADD COLUMN IF NOT EXISTS crop_data JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN post_images.fit_mode IS 'How the image should be displayed: cover (fill, crop edges) or contain (show full image, letterbox)';
COMMENT ON COLUMN post_images.aspect_ratio IS 'Target aspect ratio for the slide: 1:1, 4:5, 16:9, or 21:9';
COMMENT ON COLUMN post_images.crop_data IS 'Crop positioning data: {x, y, width, height, zoom} as percentages (0-1)';