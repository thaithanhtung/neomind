# 🔧 Fix: Lỗi khi mở Shared Link

## Các lỗi thường gặp

### 1. "Cannot coerce the result to a single JSON object"

**Nguyên nhân:**
- Query Supabase trả về nhiều rows hoặc 0 rows khi dùng `.single()`
- RLS policies chặn anonymous users truy cập `mind_map_shares`

**Giải pháp:**

Chạy migration fix để thêm policy cho anonymous users:

```sql
-- Trong Supabase Dashboard → SQL Editor, chạy:

DROP POLICY IF EXISTS "Anyone can verify share tokens" ON mind_map_shares;

CREATE POLICY "Anyone can verify share tokens"
  ON mind_map_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
```

Migration này đã có sẵn trong file `supabase/migrations/004_fix_sharing_policies.sql`

### 2. "infinite recursion detected in policy"

Xem chi tiết trong `FIX_INFINITE_RECURSION.md`

### 3. "Share token not found or inactive"

**Nguyên nhân:**
- Link đã bị revoke/delete
- Link hết hạn
- Token không tồn tại

**Giải pháp:**
- Tạo share link mới
- Check console logs để xem chi tiết

## Complete Fix Script

Chạy script sau trong **Supabase Dashboard → SQL Editor** để fix tất cả:

```sql
-- 1. Drop tất cả policies cũ
DROP POLICY IF EXISTS "Users can create share links for their mind maps" ON mind_map_shares;
DROP POLICY IF EXISTS "Users can view share links of their mind maps" ON mind_map_shares;
DROP POLICY IF EXISTS "Users can update their share links" ON mind_map_shares;
DROP POLICY IF EXISTS "Users can delete their share links" ON mind_map_shares;
DROP POLICY IF EXISTS "Anyone can verify share tokens" ON mind_map_shares;

-- 2. Tạo policies mới
-- Cho authenticated users
CREATE POLICY "Users can create share links for their mind maps"
  ON mind_map_shares FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view share links of their mind maps"
  ON mind_map_shares FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can update their share links"
  ON mind_map_shares FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their share links"
  ON mind_map_shares FOR DELETE
  USING (created_by = auth.uid());

-- ⚠️ QUAN TRỌNG: Cho phép ANYONE (kể cả anonymous) verify tokens
CREATE POLICY "Anyone can verify share tokens"
  ON mind_map_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
```

## Verify Fix

Sau khi chạy script:

### 1. Check trong Supabase Dashboard

**Authentication → Policies → mind_map_shares**

Bạn sẽ thấy 5 policies:
- ✅ Users can create share links for their mind maps (INSERT)
- ✅ Users can view share links of their mind maps (SELECT) 
- ✅ **Anyone can verify share tokens (SELECT)** ← Policy mới
- ✅ Users can update their share links (UPDATE)
- ✅ Users can delete their share links (DELETE)

### 2. Test trong Browser

```bash
# 1. Tạo share link (đã login)
✅ Click "Share" → "Tạo link mới" → Link được tạo

# 2. Mở link trong incognito (chưa login)
✅ Paste link → Mind map hiển thị read-only

# 3. Check console logs
✅ Không còn errors
```

## Debug Console Logs

Service code đã thêm logging. Check browser console để debug:

```
Loading shared mind map with token: xxx-xxx-xxx
Share data result: { shareDataArray: [...], shareError: null }
Share token valid, loading mind map: xxx-xxx-xxx
Mind map result: { mindMapDataArray: [...], mindMapError: null }
Loading mind map data for: xxx-xxx-xxx
Successfully loaded shared mind map
```

Nếu thấy error ở step nào, đó là nguyên nhân.

## Lỗi phổ biến khác

### "Mind map not found"

- Check mind map có tồn tại không
- Check RLS policies của `mind_maps` đã update chưa

### "Failed to load mind map data"

- Check RLS policies của `nodes`, `edges`, `highlighted_texts`
- Verify policies cho phép shared access

## Files đã được update

- ✅ `supabase/migrations/003_add_sharing_feature.sql` - Thêm "Anyone can verify" policy
- ✅ `supabase/migrations/004_fix_sharing_policies.sql` - Complete fix
- ✅ `src/features/mindmap/services/supabaseService.ts` - Remove `.single()`, thêm logging

## Tóm tắt

Lỗi chính là **RLS policies chặn anonymous users đọc `mind_map_shares`**.

Fix: Thêm policy "Anyone can verify share tokens" để cho phép anonymous users verify tokens.

✅ Chạy migration → Refresh browser → Done!
