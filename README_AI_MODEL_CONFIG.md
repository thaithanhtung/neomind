# 🤖 AI Model Configuration - Super Admin Feature

## Tổng quan

Tính năng này cho phép **Super Admin** cấu hình AI model sẽ được sử dụng cho tất cả mind maps. Model được lưu trong user profile và tự động áp dụng khi tạo nội dung mới.

## ✨ Tính năng chính

- ✅ **Role-based Access Control**: Chỉ Super Admin mới có quyền thay đổi AI model
- ✅ **User-level Configuration**: Model config đi theo user, không phải mind map
- ✅ **Multiple Models Support**: Hỗ trợ GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- ✅ **Auto-apply**: Model tự động được sử dụng khi tạo nội dung mới
- ✅ **Database-backed**: Lưu trữ trong database với RLS policies

## 🚀 Cài đặt

### Bước 1: Chạy Migration

```bash
# Trong Supabase Dashboard → SQL Editor
# Copy và chạy nội dung từ:
supabase/migrations/005_add_user_profiles.sql
```

Migration này sẽ:
- Tạo bảng `user_profiles` với columns: `user_id`, `role`, `ai_model`
- Tạo enum `user_role` với values: `user`, `super_admin`
- Thiết lập RLS policies
- Tạo trigger auto-create profile khi user đăng ký
- Tạo profiles cho users hiện có

### Bước 2: Set Super Admin Role

Sau khi chạy migration, set user làm Super Admin:

```sql
-- Set user làm super_admin bằng email
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Hoặc bằng user_id
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE user_id = 'USER_UUID_HERE';

-- Verify
SELECT u.email, p.role, p.ai_model 
FROM auth.users u
JOIN user_profiles p ON p.user_id = u.id
WHERE p.role = 'super_admin';
```

### Bước 3: Restart Dev Server

```bash
# Code đã được update, restart để apply changes
yarn dev
```

## 📱 Cách sử dụng

### Cho Super Admin

1. **Mở Mind Map Detail Page**
   - Click vào bất kỳ mind map nào

2. **Mở AI Model Section**
   - Tìm section "AI Model (Super Admin)" phía trên
   - Click để expand

3. **Chọn Model**
   - Chọn model từ các options:
     - **GPT-4o**: Mạnh nhất, thông minh nhất, đắt nhất
     - **GPT-4o Mini**: Cân bằng giữa hiệu suất và chi phí (recommended)
     - **GPT-3.5 Turbo**: Nhanh, rẻ, phù hợp cho tác vụ đơn giản

4. **Save**
   - Click "Cập nhật Model"
   - Model sẽ được lưu và áp dụng cho tất cả mind maps

### Cho User Thường

- User thường **không thấy** AI Model section
- Model được sử dụng là model mà Super Admin đã chọn
- Không thể thay đổi model

## 🏗️ Architecture

### Database Schema

```sql
-- Bảng user_profiles
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role user_role NOT NULL DEFAULT 'user',
  ai_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enum user_role
CREATE TYPE user_role AS ENUM ('user', 'super_admin');
```

### RLS Policies

```sql
-- User chỉ có thể đọc profile của mình
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Chỉ super_admin mới được update ai_model
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
```

### Service Layer

```typescript
// userProfileService.ts
export const userProfileService = {
  getCurrentUserProfile(): Promise<UserProfile | null>
  updateAIModel(model: string): Promise<{ success: boolean }>
  isSuperAdmin(): Promise<boolean>
}
```

### AI Service Integration

```typescript
// aiService.ts
const callOpenAI = async (prompt: string, systemPrompt?: string) => {
  // Lấy model từ user profile
  const profile = await userProfileService.getCurrentUserProfile();
  const model = profile?.ai_model || 'gpt-4o-mini';
  
  // Sử dụng model
  const response = await client.chat.completions.create({
    model: model, // ← Model từ user profile
    messages: messages,
  });
  // ...
}
```

## 🎨 UI Components

### ModelSelector Component

Location: `src/features/user/components/ModelSelector.tsx`

Features:
- ✅ Chỉ render cho Super Admin
- ✅ Radio buttons cho các model options
- ✅ Badge indicators (Premium, Recommended, Economy)
- ✅ Success/Error messages
- ✅ Loading states
- ✅ Disable button khi không có changes
- ✅ Auto-hide sau khi save thành công

### Integration trong MindMapDetailPage

```tsx
<div className='ai-model-section'>
  <button onClick={toggleModelConfig}>
    AI Model (Super Admin)
  </button>
  <div className={showModelConfig ? 'show' : 'hide'}>
    <ModelSelector />
  </div>
</div>
```

## 🔐 Security

### Database Level
- **RLS Policies**: Enforce role-based access tại database level
- **Check trong policy**: Verify `role = 'super_admin'` trước khi cho update

### Service Level
- **Pre-check**: `updateAIModel()` check role trước khi gọi API
- **Error handling**: Return error nếu không phải super_admin

### UI Level
- **Conditional Render**: Component chỉ render cho super_admin
- **Visual Indicator**: Badge "Super Admin Only" rõ ràng

## 📊 Available Models

| Model | Description | Use Case | Cost |
|-------|-------------|----------|------|
| **GPT-4o** | Mạnh nhất, thông minh nhất | Complex tasks, high quality | $$$ |
| **GPT-4o Mini** | Cân bằng | General purpose (recommended) | $$ |
| **GPT-3.5 Turbo** | Nhanh, rẻ | Simple tasks, high volume | $ |

## 🧪 Testing

### Test Super Admin Access

```bash
# 1. Set user làm super_admin trong database
UPDATE user_profiles SET role = 'super_admin' WHERE user_id = '...'

# 2. Login với user đó
✅ Mở Mind Map Detail Page

# 3. Verify AI Model section xuất hiện
✅ Thấy "AI Model (Super Admin)" section
✅ Click để expand
✅ Thấy ModelSelector component
✅ Có thể chọn và lưu model

# 4. Test model được apply
✅ Chọn model khác
✅ Click "Cập nhật Model"
✅ Tạo node mới
✅ Check console logs: "Using AI model from user profile: gpt-4o"
```

### Test Regular User

```bash
# 1. Login với user thường (role = 'user')
✅ Mở Mind Map Detail Page

# 2. Verify không thấy AI Model section
✅ KHÔNG thấy ModelSelector component
✅ Model mặc định được sử dụng

# 3. Try update trực tiếp (should fail)
# Trong console:
await userProfileService.updateAIModel('gpt-4o')
❌ Error: "Only super_admin can update AI model"
```

## 📝 Files Created/Modified

### Created (6 files)
```
✨ supabase/migrations/005_add_user_profiles.sql
✨ src/features/user/services/userProfileService.ts
✨ src/features/user/services/index.ts
✨ src/features/user/components/ModelSelector.tsx
✨ src/features/user/components/index.ts
✨ README_AI_MODEL_CONFIG.md
```

### Modified (2 files)
```
📝 src/features/ai/services/aiService.ts
📝 src/pages/MindMapDetailPage.tsx
```

## 🔍 Debugging

### Check User Role

```sql
SELECT u.email, p.role, p.ai_model, p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON p.user_id = u.id
WHERE u.email = 'your-email@example.com';
```

### Check AI Service Logs

Trong browser console khi tạo node mới:
```
Using AI model from user profile: gpt-4o-mini
```

### Common Issues

**Issue**: Component không hiển thị
- **Check**: User có role = 'super_admin' chưa?
- **Fix**: Run UPDATE query để set role

**Issue**: Cannot update model
- **Check**: RLS policies đã được apply chưa?
- **Fix**: Re-run migration

**Issue**: Model không được apply
- **Check**: Console logs có thấy "Using AI model..." không?
- **Fix**: Verify userProfileService.getCurrentUserProfile() return đúng data

## 🚀 Future Enhancements

Các tính năng có thể thêm sau:

- [ ] **Per-mind-map model**: Override model cho từng mind map cụ thể
- [ ] **Model usage tracking**: Track cost và usage
- [ ] **Model performance metrics**: So sánh quality giữa các models
- [ ] **Auto model selection**: AI tự chọn model dựa trên task complexity
- [ ] **Custom models**: Support custom fine-tuned models
- [ ] **Temperature & max_tokens config**: Thêm advanced settings

## 💡 Best Practices

1. **Default to gpt-4o-mini**: Cân bằng tốt cho hầu hết use cases
2. **Use gpt-4o for important content**: Khi cần chất lượng cao nhất
3. **Use gpt-3.5-turbo for testing**: Tiết kiệm cost khi develop
4. **Monitor costs**: Track OpenAI usage và costs
5. **Educate users**: Giải thích sự khác biệt giữa các models

## 📞 Support

Nếu gặp vấn đề:
1. Check Supabase logs
2. Check browser console
3. Verify RLS policies
4. Check user role trong database

---

**Happy configuring!** 🎉 Giờ bạn có full control over AI model selection!
