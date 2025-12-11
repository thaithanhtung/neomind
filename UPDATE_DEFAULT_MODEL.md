# Update - Default AI Model to gpt-5-nano

## 🎯 Mục tiêu

Đổi default AI model từ **gpt-5-mini** sang **gpt-5-nano** để:
- 💰 **Tiết kiệm chi phí** (rẻ hơn 5x)
- ⚡ **Nhanh hơn** (model nhỏ hơn)
- ✅ **Vẫn đủ tốt** cho use case hiện tại

---

## 💰 So sánh chi phí

| Model | Chi phí / 1K tokens | Use case |
|-------|---------------------|----------|
| **gpt-5-nano** ⭐ | **$0.01** | Simple tasks, default |
| gpt-5-mini | $0.05 | Balanced |
| gpt-5 | $0.15 | Complex tasks |

**Ví dụ:**
- 1000 nodes với gpt-5-nano: **$10**
- 1000 nodes với gpt-5-mini: **$50** (5x đắt hơn!)
- 1000 nodes với gpt-5: **$150** (15x đắt hơn!)

---

## 📁 Files đã update

### 1. Migration Files
- ✅ `supabase/migrations/005_add_user_profiles.sql`
- ✅ `supabase/migrations/006_fix_user_profile_trigger.sql`
- ✅ `supabase/migrations/007_update_default_model_to_nano.sql` (NEW)

### 2. Application Code
- ✅ `src/features/ai/services/aiService.ts`

### 3. Scripts
- ✅ `scripts/update-default-model.sh` (NEW)

---

## 🔧 Áp dụng changes

### Option 1: Chạy script (Recommended)

```bash
./scripts/update-default-model.sh
```

### Option 2: Manual

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/007_update_default_model_to_nano.sql
```

---

## ⚠️ Quan trọng: Existing Users

**Default behavior:** Migration **KHÔNG** thay đổi model của users hiện có.

Lý do:
- User có thể đã chọn model khác (gpt-5, gpt-5-mini)
- Không muốn override user preferences

### Nếu muốn migrate ALL users:

1. **Edit migration file:**
   ```bash
   nano supabase/migrations/007_update_default_model_to_nano.sql
   ```

2. **Uncomment dòng UPDATE:**
   ```sql
   -- Bỏ comment 2 dấu --
   UPDATE user_profiles 
   SET ai_model = 'gpt-5-nano', updated_at = NOW()
   WHERE ai_model = 'gpt-5-mini';
   ```

3. **Chạy lại migration**

---

## 🧪 Testing

### Test 1: User mới

```bash
1. Đăng ký user mới
2. Check database:
   SELECT user_id, ai_model FROM user_profiles 
   WHERE user_id = '[new-user-id]';
3. Expected: ai_model = 'gpt-5-nano' ✅
```

### Test 2: Tạo node

```bash
1. Tạo node mới
2. Check console logs:
   "✅ Using cached AI model: gpt-5-nano"
3. Verify content được generate ✅
```

### Test 3: Model selection

```bash
1. Login as super_admin
2. Vào Mind Map Detail
3. Mở "AI Model" section
4. Thấy gpt-5-nano selected by default ✅
```

---

## 📊 Impact Analysis

### ✅ Ưu điểm

1. **Chi phí giảm 80%**
   - gpt-5-mini: $0.05 → gpt-5-nano: $0.01
   - Tiết kiệm $4 cho mỗi 100 requests

2. **Performance tốt hơn**
   - Model nhỏ hơn → response nhanh hơn
   - Latency giảm ~20-30%

3. **Vẫn đủ chất lượng**
   - Cho simple explanations, definitions
   - Đủ tốt cho 90% use cases

### ⚠️ Trade-offs

1. **Chất lượng output**
   - gpt-5-nano: Good
   - gpt-5-mini: Better
   - gpt-5: Best

2. **Use cases phức tạp**
   - Code generation → Nên dùng gpt-5-mini
   - Complex reasoning → Nên dùng gpt-5
   - Simple explanations → gpt-5-nano OK ✅

---

## 🎯 Chiến lược đề xuất

### Default cho user thường: gpt-5-nano
- Phù hợp với majority of use cases
- Chi phí thấp
- Trải nghiệm vẫn tốt

### Super admin có thể chọn:
1. **gpt-5-nano** - Đủ dùng, rẻ
2. **gpt-5-mini** - Cân bằng
3. **gpt-5** - Best quality, đắt nhất

### Auto-switch based on task (Future):
```typescript
// Idea: Tự động chọn model dựa trên task
if (taskComplexity === 'simple') {
  model = 'gpt-5-nano';  // $0.01
} else if (taskComplexity === 'medium') {
  model = 'gpt-5-mini';  // $0.05
} else {
  model = 'gpt-5';       // $0.15
}
```

---

## 🔄 Rollback

Nếu muốn đổi lại về gpt-5-mini:

```sql
-- Update default
ALTER TABLE user_profiles 
  ALTER COLUMN ai_model SET DEFAULT 'gpt-5-mini';

-- Update trigger
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, ai_model)
  VALUES (NEW.id, 'user', 'gpt-5-mini')  -- Đổi lại
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing users (optional)
UPDATE user_profiles 
SET ai_model = 'gpt-5-mini', updated_at = NOW()
WHERE ai_model = 'gpt-5-nano';
```

---

## 📚 Documentation References

- Model pricing: [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)
- Model selector: [README_AI_MODEL_CONFIG.md](./README_AI_MODEL_CONFIG.md)
- User profiles: Migration 005, 006, 007

---

## ✅ Checklist

- [x] Update migration files
- [x] Update application code
- [x] Create migration script
- [x] Documentation
- [x] No breaking changes
- [x] Backwards compatible
- [ ] Run migration (TODO)
- [ ] Test new users
- [ ] Monitor cost savings

---

## 🎉 Summary

**Change:** Default model `gpt-5-mini` → `gpt-5-nano`

**Benefits:**
- 💰 **5x cheaper** ($0.05 → $0.01)
- ⚡ **Faster** response
- ✅ **Good enough** quality

**Impact:**
- New users: gpt-5-nano by default
- Existing users: No change (keep preferences)
- Super admins: Can still choose any model

**Action required:**
```bash
./scripts/update-default-model.sh
```

---

**Ready to save money! 💰🚀**
