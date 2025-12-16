# 🔍 Debug Edge Function Response

## Bước 1: Check Network Tab

1. Mở Chrome DevTools (F12)
2. Tab **Network**
3. Tạo node mới
4. Tìm request `generate-content`
5. Click vào request đó
6. Tab **Response**

## Câu hỏi cần trả lời:

### 1. Status code là gì?
- [ ] 200 (OK)
- [ ] 401 (Unauthorized)
- [ ] 500 (Internal Server Error)
- [ ] Khác: ___________

### 2. Response body trông như thế nào?

**Option A: OpenAI format (expected)**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Đây là nội dung AI tạo ra..."
      },
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "model": "gpt-5-nano",
  "usage": { ... }
}
```

**Option B: Error format**
```json
{
  "error": "OpenAI API error",
  "details": "..."
}
```

**Option C: Empty/null**
```json
null
```
hoặc
```json
{}
```

**Option D: Streaming format (if stream=true)**
```
data: {"choices":[{"delta":{"content":"Xin"}}]}
data: {"choices":[{"delta":{"content":" chào"}}]}
...
```

### 3. Request headers có đúng không?

- [ ] `Authorization: Bearer eyJ...` (có)
- [ ] `Content-Type: application/json` (có)

### 4. Request body là gì?

```json
{
  "prompt": "...",
  "systemPrompt": "...",
  "stream": false // hoặc true
}
```

---

## Debug Script

Paste vào Console để test:

```javascript
// Test Edge Function directly
const testEdgeFunction = async () => {
  const { data, error } = await window.supabase.functions.invoke('generate-content', {
    body: {
      prompt: 'Test prompt',
      systemPrompt: 'You are a helpful assistant',
      stream: false
    }
  });
  
  console.log('=== EDGE FUNCTION TEST ===');
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Data type:', typeof data);
  console.log('Data keys:', data ? Object.keys(data) : 'null');
  console.log('Has choices?', !!data?.choices);
  console.log('Has content?', !!data?.content);
  console.log('Full data:', JSON.stringify(data, null, 2));
  
  return { data, error };
};

// Run test
testEdgeFunction();
```

---

## Expected Results

### ✅ WORKING (OpenAI format)

```javascript
{
  error: null,
  data: {
    id: "chatcmpl-xxx",
    choices: [
      {
        message: {
          content: "Nội dung AI..."
        }
      }
    ]
  }
}
```

**Client should extract:** `data.choices[0].message.content` ✅

---

### ❌ NOT WORKING - Empty data

```javascript
{
  error: null,
  data: null // or {}
}
```

**Possible causes:**
1. Edge Function return wrong format
2. OpenAI API key invalid
3. OpenAI API error
4. Rate limit hit

---

### ❌ NOT WORKING - Error

```javascript
{
  error: { message: "..." },
  data: null
}
```

**Possible causes:**
1. Auth failed
2. Function crashed
3. Database error

---

## Fix Based on Results

### If data = `{ choices: [...] }` (OpenAI format)

✅ **Already handled!** Code should work:

```typescript
if (data?.choices?.[0]?.message?.content) {
  return data.choices[0].message.content;
}
```

---

### If data = `null` or `{}`

**Fix Edge Function:**

```typescript
// In supabase/functions/generate-content/index.ts
// Change from:
const data = await openaiResponse.json();
return new Response(JSON.stringify(data), { ... });

// To:
const data = await openaiResponse.json();
console.log('OpenAI response:', data); // ADD THIS
return new Response(JSON.stringify(data), { ... });
```

**Then check function logs:**
```bash
supabase functions logs generate-content
```

---

### If data = `{ error: "..." }`

**Edge Function hit error**, check:

```bash
supabase functions logs generate-content
```

Common issues:
- OpenAI API key not set: `supabase secrets set OPENAI_API_KEY=sk-xxx`
- OpenAI API key invalid
- Rate limit from OpenAI (not app)

---

## Common Issues & Fixes

### Issue 1: `data = null`

**Cause:** Edge Function returning `null`

**Fix:**
```typescript
// Add logging to Edge Function
console.log('About to call OpenAI with:', { model: aiModel, messages });
const openaiResponse = await fetch(...);
console.log('OpenAI status:', openaiResponse.status);
const data = await openaiResponse.json();
console.log('OpenAI data:', data);
```

### Issue 2: `data.choices` undefined

**Cause:** OpenAI API error or wrong model

**Fix:**
```bash
# Check OpenAI API key
supabase secrets list

# Check function logs
supabase functions logs generate-content --follow

# Redeploy with logging
supabase functions deploy generate-content
```

### Issue 3: Streaming not working

**Cause:** Response is stream but client expects JSON

**Fix:**
```typescript
// Check if streaming
if (onChunk && data instanceof ReadableStream) {
  console.log('✅ Streaming response detected');
  return await handleStreamingResponse(data, onChunk);
}
```

---

## Next Steps

1. **Run debug script** trong Console
2. **Share kết quả** với tôi:
   - Console output của `testEdgeFunction()`
   - Network tab -> Response body
   - Network tab -> Status code
3. **Tôi sẽ fix** dựa trên kết quả!

---

**Paste kết quả vào đây để tôi debug! 🔍**
