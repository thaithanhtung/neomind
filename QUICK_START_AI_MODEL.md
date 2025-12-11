# 🚀 Quick Start - AI Model Configuration

## Tóm tắt nhanh

Tính năng cho phép **Super Admin** chọn AI model (GPT-4o, GPT-4o Mini, GPT-3.5) được sử dụng cho tất cả mind maps.

## 📦 Cài đặt (3 bước)

### Bước 1: Chạy Migration

**Option A: Sử dụng script**
```bash
./scripts/setup-ai-model-config.sh
```

**Option B: Manual trong Supabase Dashboard**
1. Mở **Supabase Dashboard** → **SQL Editor**
2. Copy nội dung từ `supabase/migrations/005_add_user_profiles.sql`
3. Paste và Run

### Bước 2: Set Super Admin

Trong **Supabase Dashboard → SQL Editor**:

```sql
-- Thay 'your-email@example.com' bằng email của bạn
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### Bước 3: Restart & Test

```bash
# Restart dev server
yarn dev

# Login với Super Admin user
# Mở mind map → Tìm "AI Model (Super Admin)" section
# Chọn model và save!
```

## 🎯 Cách sử dụng

### Super Admin
```
1. Mở Mind Map → 2. Click "AI Model (Super Admin)" → 3. Chọn model → 4. Save
```

**Available Models:**
- 🟣 **GPT-4o** - Mạnh nhất (đắt)
- 🔵 **GPT-4o Mini** - Cân bằng (recommended)
- 🟢 **GPT-3.5 Turbo** - Nhanh & rẻ

### User thường
- Không thấy AI Model section
- Sử dụng model mà Super Admin đã chọn

## ✅ Xong!

Đơn giản vậy thôi. Xem chi tiết trong `README_AI_MODEL_CONFIG.md`

## ⚠️ Lưu ý

- Model config **đi theo user**, không phải mind map
- Chỉ **Super Admin** có thể thay đổi
- Model áp dụng cho **TẤT CẢ** mind maps của user đó

## 🆘 Troubleshooting

**Không thấy AI Model section?**
→ Check role trong database:
```sql
SELECT role FROM user_profiles WHERE user_id = auth.uid();
```

**Cannot update model?**
→ Verify bạn là super_admin và RLS policies đã chạy

## 📚 More Info

- `README_AI_MODEL_CONFIG.md` - Full documentation
- `scripts/setup-ai-model-config.sh` - Setup script
