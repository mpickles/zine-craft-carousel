-- Enable RLS on reserved_usernames table
ALTER TABLE reserved_usernames ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read reserved usernames (needed for signup validation)
CREATE POLICY "Anyone can view reserved usernames" ON reserved_usernames
  FOR SELECT USING (true);