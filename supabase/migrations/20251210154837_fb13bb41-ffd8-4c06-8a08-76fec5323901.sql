-- Fix the profiles table RLS policy to prevent PII exposure
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles (needed for admin dashboard)
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));