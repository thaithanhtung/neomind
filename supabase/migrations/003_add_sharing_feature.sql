-- Migration để thêm tính năng share mind map với quyền chỉ xem

-- Bảng mind_map_shares - Lưu thông tin chia sẻ
CREATE TABLE IF NOT EXISTS mind_map_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mind_map_id UUID NOT NULL REFERENCES mind_maps(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL, -- Token để share (dạng UUID)
  permission TEXT NOT NULL DEFAULT 'view', -- 'view' hoặc 'edit' (để mở rộng sau)
  is_active BOOLEAN DEFAULT true, -- Cho phép disable share link
  expires_at TIMESTAMPTZ, -- Optional: link hết hạn
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_mind_map_shares_token ON mind_map_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_mind_map_shares_mind_map_id ON mind_map_shares(mind_map_id);
CREATE INDEX IF NOT EXISTS idx_mind_map_shares_created_by ON mind_map_shares(created_by);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_mind_map_shares_updated_at BEFORE UPDATE ON mind_map_shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE mind_map_shares ENABLE ROW LEVEL SECURITY;

-- Policies cho mind_map_shares
-- ⚠️ IMPORTANT: Đơn giản hóa policies để tránh infinite recursion
-- Chỉ check created_by, không check mind_maps để tránh circular dependency

-- Cho phép user tạo share link (chỉ check created_by)
CREATE POLICY "Users can create share links for their mind maps"
  ON mind_map_shares FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Cho phép user xem share links của họ (chỉ check created_by)
CREATE POLICY "Users can view share links of their mind maps"
  ON mind_map_shares FOR SELECT
  USING (created_by = auth.uid());

-- ⚠️ QUAN TRỌNG: Cho phép ANYONE (kể cả anonymous) đọc active share tokens
-- Điều này cần thiết để verify shared links khi user chưa login
CREATE POLICY "Anyone can verify share tokens"
  ON mind_map_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Cho phép user update share links của họ (chỉ check created_by)
CREATE POLICY "Users can update their share links"
  ON mind_map_shares FOR UPDATE
  USING (created_by = auth.uid());

-- Cho phép user delete share links của họ (chỉ check created_by)
CREATE POLICY "Users can delete their share links"
  ON mind_map_shares FOR DELETE
  USING (created_by = auth.uid());

-- Update existing policies to allow shared access
-- Drop and recreate policies cho mind_maps
DROP POLICY IF EXISTS "Users can view their own mind maps" ON mind_maps;
CREATE POLICY "Users can view their own mind maps or shared mind maps"
  ON mind_maps FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM mind_map_shares
      WHERE mind_map_shares.mind_map_id = mind_maps.id
      AND mind_map_shares.is_active = true
      AND (mind_map_shares.expires_at IS NULL OR mind_map_shares.expires_at > NOW())
    )
  );

-- Drop and recreate policies cho nodes
DROP POLICY IF EXISTS "Users can view nodes in their mind maps" ON nodes;
CREATE POLICY "Users can view nodes in their mind maps or shared mind maps"
  ON nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = nodes.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM mind_maps
      JOIN mind_map_shares ON mind_map_shares.mind_map_id = mind_maps.id
      WHERE nodes.mind_map_id = mind_maps.id
      AND mind_map_shares.is_active = true
      AND (mind_map_shares.expires_at IS NULL OR mind_map_shares.expires_at > NOW())
    )
  );

-- Drop and recreate policies cho edges
DROP POLICY IF EXISTS "Users can view edges in their mind maps" ON edges;
CREATE POLICY "Users can view edges in their mind maps or shared mind maps"
  ON edges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mind_maps 
      WHERE mind_maps.id = edges.mind_map_id 
      AND mind_maps.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM mind_maps
      JOIN mind_map_shares ON mind_map_shares.mind_map_id = mind_maps.id
      WHERE edges.mind_map_id = mind_maps.id
      AND mind_map_shares.is_active = true
      AND (mind_map_shares.expires_at IS NULL OR mind_map_shares.expires_at > NOW())
    )
  );

-- Drop and recreate policies cho highlighted_texts
DROP POLICY IF EXISTS "Users can view highlighted texts in their mind maps" ON highlighted_texts;
CREATE POLICY "Users can view highlighted texts in their mind maps or shared mind maps"
  ON highlighted_texts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_maps.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM nodes
      JOIN mind_maps ON mind_maps.id = nodes.mind_map_id
      JOIN mind_map_shares ON mind_map_shares.mind_map_id = mind_maps.id
      WHERE nodes.id = highlighted_texts.node_id
      AND mind_map_shares.is_active = true
      AND (mind_map_shares.expires_at IS NULL OR mind_map_shares.expires_at > NOW())
    )
  );
