# Setup Supabase Edge Functions

## 🎯 Mục đích

Di chuyển OpenAI API calls sang server-side để:
- 🔒 **Bảo mật API keys** (không exposed trong client)
- 🚦 **Rate limiting** dễ dàng
- 📊 **Monitoring** tốt hơn
- 💰 **Chi phí kiểm soát** được

---

## 📁 Files đã tạo

### 1. Edge Function
- ✅ `supabase/functions/generate-content/index.ts`

### 2. Database Migration
- ✅ `supabase/migrations/008_add_rate_limiting.sql`

### 3. Client Service
- ✅ `src/features/ai/services/edgeFunctionService.ts`

### 4. Updated AI Service
- ✅ `src/features/ai/services/aiService.ts`

---

## 🚀 Deployment Steps

### Bước 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### Bước 2: Login to Supabase

```bash
supabase login
```

### Bước 3: Link Project

```bash
# Get your project ref from Supabase dashboard URL
# https://app.supabase.com/project/<PROJECT_REF>

supabase link --project-ref <PROJECT_REF>
```

### Bước 4: Run Migration

```bash
# Apply rate limiting migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/008_add_rate_limiting.sql

# Verify
psql "$SUPABASE_DB_URL" -c "SELECT * FROM user_api_usage LIMIT 1;"
```

### Bước 5: Set Environment Variables

```bash
# Set OpenAI API key (server-side only)
supabase secrets set OPENAI_API_KEY=sk-your-api-key-here

# Optional: Custom OpenAI base URL
supabase secrets set OPENAI_API_URL=https://api.openai.com/v1

# List secrets to verify
supabase secrets list
```

### Bước 6: Deploy Edge Function

```bash
# Deploy function
supabase functions deploy generate-content

# Verify deployment
supabase functions list
```

### Bước 7: Test Edge Function

```bash
# Test function locally first
supabase functions serve generate-content

# In another terminal, test with curl
curl --request POST \
  'http://localhost:54321/functions/v1/generate-content' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "Explain React",
    "systemPrompt": "You are a helpful assistant",
    "stream": false
  }'
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Client-side (Optional - for fallback only)
VITE_OPENAI_API_KEY=sk-xxx  # Optional, Edge Function preferred

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx

# Database
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
```

### Supabase Secrets (Server-side)

```bash
# Required
OPENAI_API_KEY=sk-xxx

# Optional
OPENAI_API_URL=https://api.openai.com/v1
```

---

## 📊 Rate Limiting

### Current Limits

- **Default:** 1000 requests/day per user
- **Tracked in:** `user_api_usage` table
- **Reset:** Daily at midnight

### Check Usage (SQL)

```sql
-- Get current usage
SELECT 
  u.email,
  uau.date,
  uau.request_count,
  1000 - uau.request_count as remaining
FROM user_api_usage uau
JOIN auth.users u ON u.id = uau.user_id
WHERE uau.date = CURRENT_DATE
ORDER BY uau.request_count DESC;

-- Get top users
SELECT 
  u.email,
  SUM(uau.request_count) as total_requests
FROM user_api_usage uau
JOIN auth.users u ON u.id = uau.user_id
GROUP BY u.email
ORDER BY total_requests DESC
LIMIT 10;
```

### Adjust Limits

```typescript
// In edge function: supabase/functions/generate-content/index.ts
const MAX_REQUESTS = 1000  // Change this value
```

---

## 🧪 Testing

### Test trong app:

1. **Tạo node mới**
   ```
   - Input: "Explain React"
   - Check console: "🔒 Using secure Edge Function"
   ```

2. **Check rate limiting**
   ```sql
   SELECT * FROM user_api_usage 
   WHERE user_id = auth.uid() 
   AND date = CURRENT_DATE;
   ```

3. **Test streaming**
   ```
   - Tạo node
   - Content hiển thị real-time
   ```

### Test API Usage Display:

```typescript
import { getAPIUsage } from '@/features/ai/services/edgeFunctionService';

const usage = await getAPIUsage();
console.log('Requests today:', usage.count);
console.log('Remaining:', usage.remaining);
```

---

## 🔍 Monitoring

### View Logs

```bash
# Edge function logs
supabase functions logs generate-content

# Follow logs (real-time)
supabase functions logs generate-content --follow
```

### Supabase Dashboard

1. Go to: **Functions** > **generate-content**
2. Click: **Logs** tab
3. See: Requests, errors, performance

---

## 🐛 Troubleshooting

### Error: "Missing authorization header"

**Cause:** User not logged in

**Fix:** Ensure user is authenticated before calling

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to login
}
```

### Error: "Rate limit exceeded"

**Cause:** User exceeded daily limit

**Fix:** Show user-friendly message

```typescript
try {
  await generateContent(...)
} catch (error) {
  if (error.message.includes('Rate limit')) {
    alert('Bạn đã đạt giới hạn hôm nay. Vui lòng thử lại ngày mai.')
  }
}
```

### Error: "OpenAI API key not configured"

**Cause:** Secret not set

**Fix:** 
```bash
supabase secrets set OPENAI_API_KEY=sk-xxx
```

### Edge Function not deploying

**Cause:** CLI not linked

**Fix:**
```bash
supabase link --project-ref <YOUR_PROJECT_REF>
supabase functions deploy generate-content
```

---

## 💰 Cost Optimization

### Reduce costs:

1. **Use gpt-5-nano by default** ✅ Already configured
   - $0.01 / 1K tokens vs $0.15 for gpt-5

2. **Implement caching**
   ```sql
   CREATE TABLE ai_cache (
     prompt_hash TEXT PRIMARY KEY,
     response TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Add prompt length limits**
   ```typescript
   if (prompt.length > 1000) {
     throw new Error('Prompt too long')
   }
   ```

4. **Monitor usage**
   ```sql
   -- Daily cost estimate
   SELECT 
     date,
     SUM(request_count) * 0.01 as estimated_cost
   FROM user_api_usage
   GROUP BY date
   ORDER BY date DESC;
   ```

---

## 🔄 Rollback

Nếu gặp vấn đề, fallback về client-side:

```typescript
// In .env
VITE_USE_EDGE_FUNCTION=false  # Disable edge function

// In aiService.ts
const useEdgeFunction = import.meta.env.VITE_USE_EDGE_FUNCTION !== 'false'

if (useEdgeFunction) {
  return await generateContentViaEdgeFunction(...)
} else {
  return await callOpenAI(...)  // Direct API
}
```

---

## ✅ Checklist

- [ ] Install Supabase CLI
- [ ] Login to Supabase
- [ ] Link project
- [ ] Run migration (008_add_rate_limiting.sql)
- [ ] Set OPENAI_API_KEY secret
- [ ] Deploy edge function
- [ ] Test function
- [ ] Verify rate limiting works
- [ ] Monitor logs
- [ ] Update .env (remove client-side API key)

---

## 🎉 Benefits

**Before (Client-side):**
- ❌ API key exposed
- ❌ No rate limiting
- ❌ Hard to monitor
- ❌ Security risk

**After (Edge Functions):**
- ✅ API key secure
- ✅ Rate limiting built-in
- ✅ Easy monitoring
- ✅ Cost control
- ✅ Better UX

---

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
- [OpenAI API](https://platform.openai.com/docs/api-reference)

---

**Ready to deploy! 🚀**
