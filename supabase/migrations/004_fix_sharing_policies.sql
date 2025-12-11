-- Migration để fix infinite recursion trong sharing policies
-- Chạy migration này nếu bạn gặp lỗi "infinite recursion detected in policy"

-- Drop các policies cũ của mind_map_shares
DROP POLICY IF EXISTS "Users can create share links for their mind maps" ON mind_map_shares;
DROP POLICY IF EXISTS "Users can view share links of their mind maps" ON mind_map_shares;
DROP POLICY IF EXISTS "Users can update their share links" ON mind_map_shares;
DROP POLICY IF EXISTS "Users can delete their share links" ON mind_map_shares;
DROP POLICY IF EXISTS "Anyone can verify share tokens" ON mind_map_shares;

-- Tạo lại policies đơn giản hóa (không check mind_maps để tránh circular dependency)
CREATE POLICY "Users can create share links for their mind maps"
  ON mind_map_shares FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view share links of their mind maps"
  ON mind_map_shares FOR SELECT
  USING (created_by = auth.uid());

-- ⚠️ QUAN TRỌNG: Cho phép ANYONE (kể cả anonymous) đọc active share tokens
-- Điều này cần thiết để verify shared links khi user chưa login
CREATE POLICY "Anyone can verify share tokens"
  ON mind_map_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can update their share links"
  ON mind_map_shares FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their share links"
  ON mind_map_shares FOR DELETE
  USING (created_by = auth.uid());
