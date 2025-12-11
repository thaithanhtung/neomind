-- Migration: Update default AI model to gpt-5-nano
-- Changes default from gpt-5-mini to gpt-5-nano for better cost efficiency

-- Update table default
ALTER TABLE user_profiles 
  ALTER COLUMN ai_model SET DEFAULT 'gpt-5-nano';

-- Update trigger function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, ai_model)
  VALUES (NEW.id, 'user', 'gpt-5-nano')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Update existing users với gpt-5-mini sang gpt-5-nano
-- Uncomment nếu muốn migrate existing users
-- UPDATE user_profiles 
-- SET ai_model = 'gpt-5-nano', updated_at = NOW()
-- WHERE ai_model = 'gpt-5-mini';

COMMENT ON COLUMN user_profiles.ai_model IS 'AI model preference - default: gpt-5-nano (most cost efficient)';
