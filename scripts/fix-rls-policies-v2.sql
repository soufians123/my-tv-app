-- Fix Row Level Security policies for profiles table (Version 2)
-- This version fixes the infinite recursion issue
-- Run this script in Supabase Dashboard SQL Editor

-- First: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Second: Create new policies without recursion

-- Allow authenticated users to read their own profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to create their own profiles
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profiles
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users with admin role to read all profiles (using auth.jwt())
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    auth.uid() = id
  );

-- Allow users with admin role to update all profiles (using auth.jwt())
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    auth.uid() = id
  );

-- Create function to automatically create profile when new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, is_active, is_verified)
  VALUES (NEW.id, 'user', true, false);
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- If insert fails, we don't want to prevent user creation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Row Level Security policies fixed successfully (v2)!' as message;