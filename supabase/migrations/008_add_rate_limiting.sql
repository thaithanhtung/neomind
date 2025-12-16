-- Migration: Add rate limiting infrastructure
-- Tracks API usage per user per day for rate limiting

-- Create user_api_usage table
CREATE TABLE IF NOT EXISTS user_api_usage (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- Enable RLS
ALTER TABLE user_api_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON user_api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert/update (for edge function)
CREATE POLICY "Service can manage usage"
  ON user_api_usage FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to increment usage counter
CREATE OR REPLACE FUNCTION increment_api_usage(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert or update usage count
  INSERT INTO user_api_usage (user_id, date, request_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    request_count = user_api_usage.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Create function to get current usage
CREATE OR REPLACE FUNCTION get_api_usage(
  p_user_id UUID DEFAULT auth.uid(),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT request_count INTO v_count
  FROM user_api_usage
  WHERE user_id = p_user_id AND date = p_date;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_api_usage_user_date 
  ON user_api_usage(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_user_api_usage_date 
  ON user_api_usage(date DESC);

-- Trigger to auto update updated_at
CREATE TRIGGER update_user_api_usage_updated_at 
  BEFORE UPDATE ON user_api_usage
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_api_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_api_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_api_usage TO authenticated;

-- Cleanup old data (optional - run periodically)
-- DELETE FROM user_api_usage WHERE date < CURRENT_DATE - INTERVAL '90 days';

COMMENT ON TABLE user_api_usage IS 'Tracks API usage per user per day for rate limiting';
COMMENT ON FUNCTION increment_api_usage IS 'Increments API usage counter for rate limiting';
COMMENT ON FUNCTION get_api_usage IS 'Gets current API usage count for a user';
