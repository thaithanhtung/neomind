# 🔧 Fix Edge Function Error

## 🐛 Lỗi bạn đang gặp

```
Error calling Edge Function: Error: No content in response
```

---

## ⚠️ Nguyên nhân

Edge Function **chưa được deploy** nên không có response.

---

## ✅ GIẢI PHÁP NHANH (2 options)

### Option 1: Tạm thời dùng Direct API (1 phút)

**Thêm vào `.env`:**
```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Restart dev server:**
```bash
# Stop server (Ctrl+C)
yarn dev
```

**App sẽ tự động fallback** sang direct API call.

⚠️ **Lưu ý:** API key sẽ exposed. Chỉ dùng cho development!

---

### Option 2: Deploy Edge Function (Recommended - 15 phút)

#### Bước 1: Cài Supabase CLI

```bash
brew install supabase/tap/supabase
```

#### Bước 2: Login

```bash
supabase login
```

#### Bước 3: Link Project

```bash
# Lấy PROJECT_REF từ URL Supabase Dashboard
# https://app.supabase.com/project/<PROJECT_REF>

supabase link --project-ref <PROJECT_REF>
```

#### Bước 4: Run Migration (Dùng Dashboard)

**Vì bạn không có `psql`:**

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Open file: `supabase/migrations/008_add_rate_limiting.sql`
3. Copy toàn bộ nội dung
4. Paste vào SQL Editor trong Dashboard
5. Click **Run**

**Verify:**
```sql
SELECT * FROM user_api_usage LIMIT 1;
```

#### Bước 5: Set OpenAI API Key (Server-side)

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
```

⚠️ Key này sẽ **chỉ ở server**, an toàn!

#### Bước 6: Deploy Function

```bash
supabase functions deploy generate-content
```

**Expected output:**
```
Deploying function generate-content...
✓ Function generate-content deployed successfully
```

#### Bước 7: Test

1. Reload app (không cần restart server)
2. Tạo node mới
3. Check console:
   ```
   🚀 Calling Edge Function for AI generation...
   📦 Edge Function response: { data: {...}, error: null }
   ✅ Content generated via Edge Function
   ```

---

## 📊 So sánh 2 Options

| Aspect | Direct API | Edge Function |
|--------|-----------|---------------|
| Setup time | 1 phút | 15 phút |
| Security | ❌ Exposed | ✅ Secure |
| Rate limiting | ❌ No | ✅ Yes |
| Monitoring | ❌ No | ✅ Yes |
| Production ready | ❌ No | ✅ Yes |
| **Recommend** | Dev only | **Production** |

---

## 🎯 Recommendation

**Cho development ngay:**
- ✅ Dùng Option 1 (Direct API)
- Add `VITE_OPENAI_API_KEY` vào `.env`

**Khi ready deploy production:**
- ✅ Deploy Edge Function (Option 2)
- Remove `VITE_OPENAI_API_KEY` khỏi `.env`
- Enjoy secure, rate-limited API! 🔒

---

## 🔍 Debug Console Logs

Khi tạo node, check những logs này:

```
✅ GOOD (Edge Function working):
🚀 Calling Edge Function for AI generation...
📦 Edge Function response: { data: {...}, error: null }
✅ Content generated via Edge Function

⚠️ FALLBACK (Edge Function failed, using direct API):
🚀 Calling Edge Function for AI generation...
❌ Edge Function error: ...
❌ Edge Function failed, trying direct API: ...
✅ Using cached AI model: gpt-5-nano
✅ OpenAI client created and cached

❌ ERROR (No API key at all):
🚀 Calling Edge Function for AI generation...
❌ Edge Function error: ...
❌ Edge Function failed, trying direct API: ...
⚠️ No API key, using mock response
```

---

## 💡 Quick Decision Tree

```
Do you want to use app NOW?
├─ YES → Option 1 (Direct API)
│         Add VITE_OPENAI_API_KEY to .env
│         Restart yarn dev
│         Done! ✅
│
└─ Want production-ready setup?
          → Option 2 (Edge Function)
            Install CLI
            Deploy function
            More secure! ✅
```

---

## 🆘 Still Having Issues?

**Share these logs:**
1. Console logs từ browser
2. `supabase functions logs generate-content`
3. Content của `.env` file (hide sensitive data)
4. Output của `supabase functions list`

---

**Chọn option nào cũng work! Bạn muốn làm gì? 🤔**
