-- Fix function search path
CREATE OR REPLACE FUNCTION initialize_default_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;