-- Drop existing complex profile customization tables
DROP TABLE IF EXISTS profile_blocks CASCADE;
DROP TABLE IF EXISTS profile_sections CASCADE;
DROP TABLE IF EXISTS profile_themes CASCADE;

-- Simple profile blocks table for WYSIWYG editor
CREATE TABLE profile_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  block_order INTEGER NOT NULL,
  block_type TEXT NOT NULL, -- 'header', 'text', 'image', 'latest-posts', 'links', 'featured-collection', 'embed', 'spacer'
  block_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  grid_position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 12, "h": 4}'::jsonb, -- x, y, w (width), h (height) for grid layout
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX idx_profile_blocks_user_order ON profile_blocks(user_id, block_order);

-- Enable RLS
ALTER TABLE profile_blocks ENABLE ROW LEVEL SECURITY;

-- Users can manage own profile blocks
CREATE POLICY "Users can manage own profile blocks"
  ON profile_blocks
  FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can view profile blocks
CREATE POLICY "Anyone can view profile blocks"
  ON profile_blocks
  FOR SELECT
  USING (true);

-- Function to initialize default profile for new users
CREATE OR REPLACE FUNCTION public.initialize_default_profile_blocks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default header block
  INSERT INTO public.profile_blocks (user_id, block_order, block_type, block_data, grid_position)
  VALUES (
    NEW.id,
    0,
    'header',
    jsonb_build_object(
      'displayName', COALESCE(NEW.username, 'New User'),
      'bio', 'New to Zine',
      'avatarUrl', NEW.avatar_url
    ),
    jsonb_build_object('x', 0, 'y', 0, 'w', 12, 'h', 3)
  );

  -- Create default latest-posts block
  INSERT INTO public.profile_blocks (user_id, block_order, block_type, block_data, grid_position)
  VALUES (
    NEW.id,
    1,
    'latest-posts',
    jsonb_build_object(
      'count', 6,
      'layout', 'grid',
      'showCaptions', true
    ),
    jsonb_build_object('x', 0, 'y', 3, 'w', 12, 'h', 6)
  );

  RETURN NEW;
END;
$$;

-- Trigger to create default profile blocks on signup
CREATE TRIGGER on_profile_created_blocks
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_default_profile_blocks();