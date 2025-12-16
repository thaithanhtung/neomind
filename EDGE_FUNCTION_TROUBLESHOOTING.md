# 🐛 Edge Function Troubleshooting

## Error: "No content in response"

### Nguyên nhân

Lỗi này xảy ra khi:
1. ❌ Edge Function **chưa được deploy**
2. ❌ Edge Function bị **lỗi runtime**
3. ❌ Migration **chưa chạy**
4. ❌ OpenAI API key **chưa set**

---

## 🔍 Kiểm tra

### 1. Check Console Logs

Khi tạo node, check console sẽ thấy:

**Nếu chưa deploy:**
```
🚀 Calling Edge Function for AI generation...
📦 Edge Function response: { data: null, error: { message: "FunctionsRelayError..." } }
❌ Edge Function error: ...
❌ Edge Function failed, trying direct API: ...
```

**Nếu đã deploy đúng:**
```
🚀 Calling Edge Function for AI generation...
📦 Edge Function response: { data: { choices: [...] }, error: null }
✅ Content generated via Edge Function
```

---

## ✅ Giải pháp

### Quick Fix: Tạm thời dùng Direct API

Nếu muốn dùng app ngay, thêm vào `.env`:

```env
# Temporarily bypass edge function
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

App sẽ tự động fallback sang direct API call.

⚠️ **Lưu ý:** API key sẽ exposed trong client. Chỉ dùng tạm thời!

---

## 🚀 Deploy Edge Function (Proper Solution)

### Bước 1: Cài đặt Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Verify
supabase --version
```

### Bước 2: Login

```bash
supabase login
```

Browser sẽ mở để authenticate.

### Bước 3: Link Project

```bash
# Lấy PROJECT_REF từ Supabase Dashboard URL
# https://app.supabase.com/project/<PROJECT_REF>

supabase link --project-ref <PROJECT_REF>
```

### Bước 4: Run Migration

**Option A: Dùng Dashboard (Nếu không có psql)**

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Open: `supabase/migrations/008_add_rate_limiting.sql`
3. Copy toàn bộ nội dung
4. Paste vào SQL Editor
5. Click **Run**

**Option B: Dùng psql**

```bash
# Cài psql nếu chưa có
brew install postgresql@15

# Run migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/008_add_rate_limiting.sql
```

### Bước 5: Set OpenAI API Key

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
```

⚠️ **Quan trọng:** Đây là key **server-side**, an toàn hơn client-side!

### Bước 6: Deploy Function

```bash
supabase functions deploy generate-content
```

**Expected output:**
```
Deploying function generate-content...
Function generate-content deployed successfully
Function URL: https://xxx.supabase.co/functions/v1/generate-content
```

### Bước 7: Verify

```bash
# List functions
supabase functions list

# Check logs
supabase functions logs generate-content
```

---

## 🧪 Test

### Test 1: Check Function exists

```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-content \
  -X POST \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

**Expected:** `401 Unauthorized` (good! means function exists)

**Not expected:** `404 Not Found` (means not deployed)

### Test 2: Trong App

1. Reload app: `Cmd/Ctrl + R`
2. Tạo node mới
3. Check console logs:
   ```
   🚀 Calling Edge Function for AI generation...
   📦 Edge Function response: { data: {...}, error: null }
   ✅ Content generated via Edge Function
   ```

### Test 3: Check Database

```sql
-- Verify table exists
SELECT * FROM user_api_usage LIMIT 1;

-- Should see counter increment
SELECT * FROM user_api_usage 
WHERE user_id = auth.uid();
```

---

## 🔄 Alternative: Chạy Script Deploy

Nếu đã cài CLI, chạy script tự động:

```bash
./scripts/deploy-edge-functions.sh
```

Script sẽ:
1. ✅ Check CLI installed
2. ✅ Login if needed
3. ✅ Run migration
4. ✅ Set secrets
5. ✅ Deploy function
6. ✅ Verify deployment

---

## 🐛 Common Issues

### Issue 1: "command not found: supabase"

**Fix:**
```bash
brew install supabase/tap/supabase
```

### Issue 2: "command not found: psql"

**Fix:**
```bash
# Option A: Install psql
brew install postgresql@15

# Option B: Use Dashboard
# Go to Supabase Dashboard > SQL Editor
# Run migration manually
```

### Issue 3: "Function not found"

**Fix:**
```bash
# Redeploy
supabase functions deploy generate-content

# Verify
supabase functions list
```

### Issue 4: "OpenAI API key not configured"

**Fix:**
```bash
# Set secret
supabase secrets set OPENAI_API_KEY=sk-xxx

# Verify
supabase secrets list
```

### Issue 5: "Rate limit exceeded"

**Fix:**
```sql
-- Reset counter
DELETE FROM user_api_usage 
WHERE user_id = auth.uid();
```

---

## 📋 Checklist

Deploy checklist:

- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged in (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] Migration ran (via psql or Dashboard)
- [ ] OpenAI key set (`supabase secrets set`)
- [ ] Function deployed (`supabase functions deploy`)
- [ ] Function verified (`supabase functions list`)
- [ ] Tested in app (check console logs)
- [ ] Database updated (check `user_api_usage`)

---

## 💡 Tips

### Tip 1: View Logs Real-time

```bash
supabase functions logs generate-content --follow
```

### Tip 2: Test Locally First

```bash
# Serve function locally
supabase functions serve generate-content

# Test in another terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-content' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"prompt":"Test","stream":false}'
```

### Tip 3: Check Function Status

```bash
# List all functions
supabase functions list

# Should show:
# NAME               STATUS    REGION
# generate-content   ACTIVE    us-east-1
```

---

## 🆘 Still Not Working?

### Debug Steps:

1. **Check console logs** trong browser DevTools
2. **Check function logs:** `supabase functions logs generate-content`
3. **Verify secrets:** `supabase secrets list`
4. **Test direct API** (với VITE_OPENAI_API_KEY trong .env)
5. **Check Supabase Dashboard** > Functions tab

### Get Help:

- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## 🎉 Success Indicators

Khi mọi thứ work:

✅ Console shows: `🔒 Using secure Edge Function`
✅ Content generates without errors
✅ No API key in .env (secure!)
✅ Rate limiting working
✅ Logs show requests in Dashboard

---

**Nếu cần help, hãy share console logs! 🙌**
