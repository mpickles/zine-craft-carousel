-- Make username nullable since we set it after signup
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;