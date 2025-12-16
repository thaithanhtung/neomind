# 🚀 Quick Start - Edge Functions

## Deploy trong 5 phút

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2. Run Deploy Script

```bash
./scripts/deploy-edge-functions.sh
```

Script sẽ tự động:
- ✅ Run migration (rate limiting)
- ✅ Set OpenAI API key secret
- ✅ Deploy edge function
- ✅ Test deployment

### 3. Remove Client-side API Key

```bash
# In .env - remove or comment out:
# VITE_OPENAI_API_KEY=sk-xxx  # Not needed anymore
```

### 4. Test

1. Tạo node mới trong app
2. Check console: `🔒 Using secure Edge Function`
3. Verify content generates successfully

---

## ✅ What you get

- 🔒 **Secure:** API key on server only
- 🚦 **Rate limiting:** 1000 requests/day per user
- 📊 **Monitoring:** Built-in logs
- ⚡ **Streaming:** Real-time responses
- 💰 **Cost control:** Track usage in database

---

## 📚 Full Documentation

See: [EDGE_FUNCTIONS_SETUP.md](./EDGE_FUNCTIONS_SETUP.md)

---

## 🆘 Troubleshooting

**Edge function not working?**
```bash
# Check logs
supabase functions logs generate-content

# Redeploy
supabase functions deploy generate-content
```

**Rate limit hit?**
```sql
-- Check usage
SELECT * FROM user_api_usage 
WHERE user_id = auth.uid() 
AND date = CURRENT_DATE;
```

---

**Done! 🎉**
