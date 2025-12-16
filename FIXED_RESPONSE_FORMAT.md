# ✅ Fixed Edge Function Response Format

## 🎯 Vấn đề đã fix

**Before:** Edge Function trả về response nhưng client không parse được format

**After:** Client có thể handle **tất cả** các format responses có thể từ Edge Function

---

## 🔧 Những gì đã thay đổi

### 1. **Helper Function: `extractContentFromResponse`**

Thử extract content từ 5 formats khác nhau:

```typescript
const extractContentFromResponse = (data: any): string | null => {
  const formats = [
    // Format 1: Standard OpenAI chat
    () => data?.choices?.[0]?.message?.content,
    
    // Format 2: OpenAI completion
    () => data?.choices?.[0]?.text,
    
    // Format 3: Wrapped content
    () => data?.content,
    
    // Format 4: Nested (Supabase wrapper)
    () => data?.data?.choices?.[0]?.message?.content,
    
    // Format 5: Direct string
    () => (typeof data === 'string' && data.trim()) ? data : null,
  ];

  for (const format of formats) {
    try {
      const content = format();
      if (content && typeof content === 'string' && content.trim()) {
        return content;
      }
    } catch (e) {
      continue; // Try next format
    }
  }

  return null;
};
```

### 2. **Enhanced Logging**

Bây giờ log rõ ràng hơn:

```javascript
📦 Edge Function response: { data, error }
📦 Exact response data: {
  type: "object",
  keys: ["id", "choices", "model"],
  hasChoices: true
}
✅ Content extracted successfully from Edge Function
Content preview: "Đây là nội dung AI tạo ra..."
```

### 3. **Better Error Messages**

Nếu không extract được, log **toàn bộ** response để debug:

```javascript
⚠️ Could not extract content from Edge Function response
Response data: { ... full JSON ... }
Response type: "object"
Is null? false
Is empty object? false
```

---

## 🧪 Test Ngay Bây Giờ

### Bước 1: Reload App

```bash
# App đang chạy? Không cần restart
# Chỉ cần reload browser: Cmd/Ctrl + R
```

### Bước 2: Tạo Node Mới

1. Click vào node
2. Select text
3. Tạo related node

### Bước 3: Check Console Logs

**Expected logs:**

```javascript
🔒 Using secure Edge Function for AI generation
🚀 Calling Edge Function for AI generation...
📦 Edge Function response: { data: {...}, error: null }
📦 Exact response data: {
  type: "object",
  isNull: false,
  keys: ["id", "choices", "model", "usage"],
  hasChoices: true,
  hasContent: false,
  firstChoice: { message: { content: "..." } }
}
✅ Content extracted successfully from Edge Function
Content preview: "Machine Learning là một..."
```

**If still error:**

```javascript
⚠️ Could not extract content from Edge Function response
Response data: { ... }  // ← COPY THIS!
```

→ **Share phần này** để tôi xem exact format!

---

## 📋 Supported Response Formats

Client hiện tại **tự động handle** tất cả formats:

### ✅ Format 1: Standard OpenAI Chat (Most Common)

```json
{
  "id": "chatcmpl-xxx",
  "choices": [
    {
      "message": {
        "content": "Nội dung AI..."
      }
    }
  ]
}
```

**Extracted:** `choices[0].message.content`

---

### ✅ Format 2: OpenAI Completion (Older Models)

```json
{
  "choices": [
    {
      "text": "Nội dung AI..."
    }
  ]
}
```

**Extracted:** `choices[0].text`

---

### ✅ Format 3: Wrapped Content

```json
{
  "content": "Nội dung AI..."
}
```

**Extracted:** `content`

---

### ✅ Format 4: Nested (Supabase Wrapper)

```json
{
  "data": {
    "choices": [
      {
        "message": {
          "content": "Nội dung AI..."
        }
      }
    ]
  }
}
```

**Extracted:** `data.choices[0].message.content`

---

### ✅ Format 5: Direct String

```json
"Nội dung AI trả về trực tiếp..."
```

**Extracted:** Directly as string

---

## 🔍 Debug Commands

Nếu vẫn lỗi, chạy các commands sau:

### 1. Test Edge Function Directly

Paste vào **Browser Console**:

```javascript
const testEdgeFunction = async () => {
  const { data, error } = await window.supabase.functions.invoke('generate-content', {
    body: {
      prompt: 'Giải thích Machine Learning',
      systemPrompt: 'Bạn là trợ lý AI',
      stream: false
    }
  });
  
  console.log('=== TEST RESULT ===');
  console.log('Error:', error);
  console.log('Data type:', typeof data);
  console.log('Data:', data);
  console.log('Data keys:', data ? Object.keys(data) : null);
  console.log('Has choices?', !!data?.choices);
  console.log('First choice:', data?.choices?.[0]);
  console.log('Content:', data?.choices?.[0]?.message?.content);
  
  return { data, error };
};

testEdgeFunction();
```

### 2. Check Edge Function Logs

```bash
supabase functions logs generate-content --follow
```

Logs sẽ show:
- Request received
- OpenAI API called
- Response sent

### 3. Check Network Tab

1. DevTools → Network
2. Tạo node mới
3. Tìm `generate-content` request
4. Check:
   - **Status:** Should be `200`
   - **Response:** Should have `choices` array
   - **Headers:** `Content-Type: application/json`

---

## 🐛 Common Issues & Solutions

### Issue 1: "No content in response"

**Symptoms:**
```
⚠️ Could not extract content from Edge Function response
Response data: null
```

**Cause:** Edge Function returned `null`

**Solutions:**
1. Check Edge Function deployed: `supabase functions list`
2. Check OpenAI key set: `supabase secrets list`
3. Check function logs: `supabase functions logs generate-content`

---

### Issue 2: Empty response `{}`

**Symptoms:**
```
Response data: {}
Is empty object? true
```

**Cause:** Edge Function error but not throwing

**Solution:**
Check function logs for errors:
```bash
supabase functions logs generate-content
```

Common causes:
- OpenAI API key invalid
- Rate limit from OpenAI (their side)
- Model not available

---

### Issue 3: Error response

**Symptoms:**
```
Response data: { "error": "OpenAI API error", "details": "..." }
```

**Cause:** OpenAI API rejected request

**Solution:**
1. Check model name correct: `gpt-5-nano` (not `gpt-4o-mini`)
2. Check API key valid
3. Check OpenAI account has credits

---

### Issue 4: `data.data.choices` (Nested)

**Symptoms:**
```
Response data: {
  data: {
    choices: [...]
  }
}
```

**Cause:** Supabase wrapping response

**Status:** ✅ **Already handled!** Format 4 will extract this.

---

## 📊 Response Flow

```
User creates node
    ↓
Client calls generateContent()
    ↓
Try Edge Function first 🔒
    ↓
Supabase Edge Function
    ↓
Calls OpenAI API
    ↓
Returns response in one of 5 formats
    ↓
extractContentFromResponse() tries all formats
    ↓
Returns content string ✅
    ↓
Node displays content
```

---

## ✅ Verification Checklist

- [ ] Build successful (`npm run build`)
- [ ] App reloaded in browser
- [ ] Created test node
- [ ] Console shows `✅ Content extracted successfully`
- [ ] Node displays AI-generated content
- [ ] No errors in console

---

## 🎉 Success Indicators

Khi everything works:

```javascript
✅ Console logs:
   🔒 Using secure Edge Function
   🚀 Calling Edge Function...
   📦 Edge Function response: { data: {...} }
   ✅ Content extracted successfully

✅ Node shows AI content

✅ No fallback to Direct API

✅ No errors
```

---

## 🆘 Still Not Working?

**Share these with me:**

1. **Console logs** (toàn bộ output khi tạo node)
2. **Network tab** (response của `generate-content`)
3. **Test script output** (từ browser console)
4. **Function logs** (`supabase functions logs generate-content`)

**Với info trên, tôi sẽ fix ngay! 🚀**

---

## 📚 Related Files

- `src/features/ai/services/edgeFunctionService.ts` - Client service
- `supabase/functions/generate-content/index.ts` - Edge Function
- `DEBUG_EDGE_FUNCTION.md` - Debug guide
- `FIX_EDGE_FUNCTION_ERROR.md` - Setup guide

---

**Try reload app và test ngay! 🎯**
