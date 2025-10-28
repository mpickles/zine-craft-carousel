-- Add new fields to posts table for location
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT CHECK (aspect_ratio IN ('1:1', '4:5', '16:9'));

-- Add aspect_ratio to post_images table
ALTER TABLE post_images 
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT CHECK (aspect_ratio IN ('1:1', '4:5', '16:9'));

-- Create table for tagged users in posts
CREATE TABLE IF NOT EXISTS post_tagged_users (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Enable RLS on post_tagged_users
ALTER TABLE post_tagged_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_tagged_users
CREATE POLICY "Users can view tagged users in public posts"
ON post_tagged_users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_tagged_users.post_id 
    AND posts.is_private = false
  )
  OR
  auth.uid() IN (
    SELECT user_id FROM posts WHERE posts.id = post_tagged_users.post_id
  )
);

CREATE POLICY "Post creators can tag users"
ON post_tagged_users FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM posts WHERE posts.id = post_tagged_users.post_id
  )
);

CREATE POLICY "Post creators can remove tagged users"
ON post_tagged_users FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM posts WHERE posts.id = post_tagged_users.post_id
  )
);

-- Add comment to explain the table
COMMENT ON TABLE post_tagged_users IS 'Users tagged in posts (max 5 per post)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_post_tagged_users_post_id ON post_tagged_users(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tagged_users_user_id ON post_tagged_users(user_id);