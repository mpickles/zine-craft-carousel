-- Add alt_text column to post_images (slides) for accessibility
ALTER TABLE post_images ADD COLUMN IF NOT EXISTS alt_text text;

-- Create saves table (bookmarks separate from collections)
CREATE TABLE IF NOT EXISTS saves (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Enable RLS on saves
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

-- RLS policies for saves
CREATE POLICY "Users can view their own saves"
  ON saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves"
  ON saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON saves FOR DELETE
  USING (auth.uid() = user_id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_images_post_order ON post_images(post_id, order_index);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_post ON collection_items(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_saves_user ON saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_post ON saves(post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);

-- Add comment about email storage
COMMENT ON TABLE profiles IS 'User profile data. Email is stored in auth.users table, not here, for security.';
COMMENT ON COLUMN post_images.order_index IS 'Slide order (1-12). Renamed from slide_order for consistency.';
COMMENT ON COLUMN post_images.alt_text IS 'Alt text for accessibility (required for screen readers)';
COMMENT ON TABLE saves IS 'Quick bookmarks/saves separate from organized collections';
COMMENT ON COLUMN collections.is_public IS 'Public visibility (inverse of is_private in spec)';
COMMENT ON COLUMN collections.cover_image_url IS 'Cover image URL (named cover_url in spec)';