-- Migration: Fix user profile creation trigger for new user registration
-- Issue: RLS policies block trigger because auth.uid() is NULL during trigger execution

-- Drop existing policy that blocks trigger
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create new policy that allows:
-- 1. Users to insert their own profile
-- 2. Service role (trigger) to insert any profile
CREATE POLICY "Users and service can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR  -- User inserting their own
    auth.uid() IS NULL       -- Service role (trigger)
  );

-- Alternative: Make trigger function run with SECURITY DEFINER and bypass RLS
-- This is safer as it explicitly bypasses RLS for this specific function

-- Drop and recreate trigger function with explicit RLS bypass
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER 
SECURITY DEFINER  -- Run with function owner's privileges
SET search_path = public
AS $$
BEGIN
  -- Explicitly insert bypassing RLS
  INSERT INTO public.user_profiles (user_id, role, ai_model)
  VALUES (NEW.id, 'user', 'gpt-5-nano')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.user_profiles TO authenticated;

-- Verify and fix any existing users without profiles
INSERT INTO user_profiles (user_id, role, ai_model)
SELECT id, 'user', 'gpt-5-nano'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON FUNCTION create_user_profile() IS 'Auto-create user profile on registration (SECURITY DEFINER to bypass RLS)';
