# Hướng dẫn Tích hợp OpenAI API

## Tổng quan

Ứng dụng đã được tích hợp OpenAI API để tạo nội dung cho các node trong mind map. Nếu không cấu hình OpenAI API key, ứng dụng sẽ tự động sử dụng mock responses.

## Cấu hình OpenAI API

### Bước 1: Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/api-keys
2. Đăng nhập hoặc tạo tài khoản mới
3. Click "Create new secret key"
4. Copy API key (chỉ hiển thị 1 lần, hãy lưu lại)

### Bước 2: Cấu hình Environment Variables

1. Mở file `.env` trong project root
2. Thêm các biến sau:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-api-key-here

# Optional: Custom API URL (nếu dùng proxy hoặc custom endpoint)
# VITE_OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# Optional: Model to use (default: gpt-3.5-turbo)
# Các model có sẵn: gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview
# VITE_OPENAI_MODEL=gpt-3.5-turbo
```

3. Restart dev server sau khi thay đổi `.env`:
```bash
npm run dev
```

### Bước 3: Kiểm tra

1. Tạo một node mới với chủ đề bất kỳ
2. Kiểm tra console để xem có gọi OpenAI API không
3. Nếu có lỗi, kiểm tra:
   - API key đã đúng chưa
   - Có đủ credits trong OpenAI account không
   - Network connection có ổn không

## Fallback Behavior

Nếu không cấu hình OpenAI API key hoặc có lỗi khi gọi API:
- Ứng dụng sẽ tự động sử dụng mock responses
- Vẫn hoạt động bình thường nhưng với nội dung mock
- Console sẽ hiển thị warning để bạn biết

## API Usage

### generateContent(prompt: string)
Tạo nội dung cho node mới dựa trên prompt.

**Ví dụ:**
```typescript
const content = await generateContent("React là gì?");
```

### generateRelatedContent(selectedText: string, context: string, customPrompt?: string)
Tạo nội dung liên quan dựa trên text đã chọn và context.

**Ví dụ:**
```typescript
const content = await generateRelatedContent(
  "component",
  "React",
  "Giải thích về component trong React"
);
```

## Cost Estimation

- **gpt-3.5-turbo**: ~$0.0015 per 1K tokens (rẻ nhất)
- **gpt-4**: ~$0.03 per 1K tokens (đắt hơn nhưng chất lượng tốt hơn)
- Mỗi node mới thường sử dụng ~200-500 tokens

**Lưu ý**: Hãy theo dõi usage trong OpenAI dashboard để tránh chi phí phát sinh không mong muốn.

## Troubleshooting

### Lỗi "OpenAI API key chưa được cấu hình"
- Kiểm tra file `.env` đã có `VITE_OPENAI_API_KEY` chưa
- Đảm bảo API key bắt đầu với `sk-`
- Restart dev server sau khi thay đổi `.env`

### Lỗi "OpenAI API error: 401"
- API key không đúng hoặc đã hết hạn
- Kiểm tra lại API key trong OpenAI dashboard

### Lỗi "OpenAI API error: 429"
- Đã vượt quá rate limit
- Đợi một chút rồi thử lại
- Hoặc upgrade plan trong OpenAI

### Lỗi "OpenAI API error: Insufficient quota"
- Account không còn credits
- Nạp thêm credits vào OpenAI account

### Response quá chậm
- Có thể do network hoặc OpenAI server
- Thử đổi model sang `gpt-3.5-turbo` (nhanh hơn `gpt-4`)
- Hoặc sử dụng mock responses để test

## Security Best Practices

1. **KHÔNG commit `.env` file vào Git**
   - File `.env` đã được thêm vào `.gitignore`
   - Chỉ commit `.env.example` với placeholder values

2. **Sử dụng Environment Variables trong Production**
   - Không hardcode API key trong code
   - Sử dụng environment variables của hosting platform
   - Ví dụ: Vercel, Netlify đều hỗ trợ env vars

3. **Rotate API Keys định kỳ**
   - Thay đổi API key nếu nghi ngờ bị lộ
   - Revoke old keys trong OpenAI dashboard

4. **Set Usage Limits**
   - Cấu hình usage limits trong OpenAI dashboard
   - Để tránh chi phí phát sinh không kiểm soát

## Advanced Configuration

### Sử dụng Custom Proxy

Nếu bạn muốn sử dụng proxy server để gọi OpenAI API:

```env
VITE_OPENAI_API_URL=https://your-proxy.com/v1/chat/completions
```

### Sử dụng Model khác

```env
VITE_OPENAI_MODEL=gpt-4
```

Các model có sẵn:
- `gpt-3.5-turbo` (mặc định, rẻ nhất)
- `gpt-4` (chất lượng tốt hơn, đắt hơn)
- `gpt-4-turbo-preview` (mới nhất)

