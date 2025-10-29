-- Create profile sections table
CREATE TABLE profile_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_order INTEGER NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'content',
  background_color TEXT DEFAULT '#FFFFFF',
  background_image_url TEXT,
  padding_size TEXT DEFAULT 'medium',
  is_header BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile blocks table
CREATE TABLE profile_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES profile_sections(id) ON DELETE CASCADE,
  block_order INTEGER NOT NULL,
  block_type TEXT NOT NULL,
  block_data JSONB NOT NULL DEFAULT '{}',
  width TEXT DEFAULT 'full',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile themes table
CREATE TABLE profile_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  font_heading TEXT DEFAULT 'Playfair Display',
  font_body TEXT DEFAULT 'Inter',
  color_primary TEXT DEFAULT '#000000',
  color_secondary TEXT DEFAULT '#666666',
  color_accent TEXT DEFAULT '#D4846A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE profile_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_sections
CREATE POLICY "Users can view all profile sections"
  ON profile_sections FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own profile sections"
  ON profile_sections FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for profile_blocks
CREATE POLICY "Users can view all profile blocks"
  ON profile_blocks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profile_sections
    WHERE profile_sections.id = profile_blocks.section_id
  ));

CREATE POLICY "Users can manage own profile blocks"
  ON profile_blocks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profile_sections
    WHERE profile_sections.id = profile_blocks.section_id
    AND profile_sections.user_id = auth.uid()
  ));

-- RLS Policies for profile_themes
CREATE POLICY "Users can view all profile themes"
  ON profile_themes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own profile theme"
  ON profile_themes FOR ALL
  USING (auth.uid() = user_id);

-- Function to initialize default profile for new users
CREATE OR REPLACE FUNCTION initialize_default_profile()
RETURNS TRIGGER AS $$
DECLARE
  header_section_id UUID;
  content_section_id UUID;
BEGIN
  -- Create default theme
  INSERT INTO profile_themes (user_id)
  VALUES (NEW.id);
  
  -- Create header section
  INSERT INTO profile_sections (user_id, section_order, section_type, is_header)
  VALUES (NEW.id, 0, 'header', true)
  RETURNING id INTO header_section_id;
  
  -- Create content section
  INSERT INTO profile_sections (user_id, section_order, section_type)
  VALUES (NEW.id, 1, 'content')
  RETURNING id INTO content_section_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize profile on user creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_default_profile();