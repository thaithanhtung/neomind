-- Migration: Add user profiles with roles and AI model configuration

-- Tạo enum cho user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tạo bảng user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  ai_model TEXT NOT NULL DEFAULT 'gpt-5-nano',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: User chỉ có thể đọc profile của mình
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policies: User có thể insert profile của mình (khi đăng ký)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies: Chỉ super_admin mới được update ai_model
-- User thường có thể update các fields khác (nếu có thêm sau này)
CREATE POLICY "Super admin can update ai_model"
  ON user_profiles FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Trigger function để tự động tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, role, ai_model)
  VALUES (NEW.id, 'user', 'gpt-5-nano')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger để auto create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Trigger để auto update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Tạo profiles cho users hiện có (nếu có)
INSERT INTO user_profiles (user_id, role, ai_model)
SELECT id, 'user', 'gpt-5-nano'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Comment
COMMENT ON TABLE user_profiles IS 'User profiles with roles and AI model preferences';
COMMENT ON COLUMN user_profiles.role IS 'User role: user or super_admin';
COMMENT ON COLUMN user_profiles.ai_model IS 'AI model preference (only super_admin can change)';
