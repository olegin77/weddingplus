-- Fix: Remove public access to profiles table to prevent personal data exposure
-- This policy allows anyone (including unauthenticated users) to read all user emails, phones, and names
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Add restricted policy: Only authenticated users can view vendor profiles (needed for marketplace)
-- This allows couples to see vendor contact info when browsing vendors
CREATE POLICY "Authenticated users can view vendor profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'vendor');

-- Note: The existing "Users can view their own profile" policy ensures users can always see their own data