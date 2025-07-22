-- Add email_verified column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Update existing rows to set email_verified based on auth.users email_confirmed_at
UPDATE profiles 
SET email_verified = EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = profiles.id 
    AND auth.users.email_confirmed_at IS NOT NULL
); 