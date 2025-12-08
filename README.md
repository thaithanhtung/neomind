# NeoMind - Sơ đồ tư duy thông minh

NeoMind là một ứng dụng web giúp bạn tạo sơ đồ tư duy động và tương tác bằng cách sử dụng AI để tạo nội dung và liên kết các khái niệm.

## Tính năng

- 🧠 **Tạo nội dung bằng AI**: Nhập chủ đề hoặc câu hỏi, AI sẽ tạo nội dung giải thích chi tiết
- 🎯 **Bôi đen và mở rộng**: Bôi đen từ/cụm từ trong nội dung để tạo nút mới trong sơ đồ
- 🌳 **Sơ đồ tư duy động**: Tự động tạo và liên kết các nút trong sơ đồ tư duy
- 🎨 **Giao diện đẹp**: UI hiện đại với TailwindCSS
- 🔄 **Tương tác mượt mà**: Kéo thả, zoom, pan trong sơ đồ tư duy

## Công nghệ sử dụng

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **ReactFlow** - Mind map visualization
- **Vite** - Build tool

## Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Setup Supabase Database** (Quan trọng!)
   - Xem hướng dẫn chi tiết trong [README_SETUP_DB.md](./README_SETUP_DB.md)
   - Hoặc chạy file `supabase/setup_complete.sql` trong Supabase SQL Editor
   - **Lưu ý**: Nếu gặp lỗi "Could not find the table 'public.mind_maps'", bạn cần chạy migration trước!

3. **Cấu hình Environment Variables:**
```bash
# Copy file .env.example thành .env
cp .env.example .env

# Hoặc chạy script setup
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

4. **Chạy development server:**
```bash
npm run dev
```

5. **Build cho production:**
```bash
npm run build
```

## Setup Database

**⚠️ QUAN TRỌNG**: Bạn phải setup database trên Supabase trước khi chạy ứng dụng!

Xem hướng dẫn chi tiết: [README_SETUP_DB.md](./README_SETUP_DB.md)

Tóm tắt nhanh:
1. Vào Supabase Dashboard > SQL Editor
2. Copy nội dung file `supabase/setup_complete.sql`
3. Paste và chạy trong SQL Editor
4. Refresh Schema Cache trong Settings > API

## Cách sử dụng

1. Nhập chủ đề hoặc câu hỏi vào ô input ở đầu trang
2. AI sẽ tạo nội dung giải thích và hiển thị trong một nút trên sơ đồ
3. Bôi đen từ/cụm từ trong nội dung mà bạn muốn tìm hiểu thêm
4. Nhập câu hỏi về từ/cụm từ đó
5. Một nút mới sẽ được tạo và liên kết với nút gốc
6. Tiếp tục mở rộng sơ đồ tư duy theo nhu cầu của bạn

## Cấu trúc dự án

```
src/
├── components/       # React components
│   ├── TopicInput.tsx      # Input component
│   ├── ContentDisplay.tsx  # Content display với text selection
│   ├── MindMap.tsx         # ReactFlow wrapper
│   └── CustomNode.tsx      # Custom node component
├── contexts/        # React contexts
│   └── MindMapContext.tsx  # Context cho mind map
├── services/        # Services
│   └── aiService.ts        # Mock AI service
├── types/          # TypeScript types
│   └── index.ts
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Tích hợp OpenAI API

Ứng dụng đã được tích hợp OpenAI API để tạo nội dung cho các node. 

**Xem hướng dẫn chi tiết**: [README_OPENAI.md](./README_OPENAI.md)

**Tóm tắt nhanh:**
1. Lấy API key từ https://platform.openai.com/api-keys
2. Thêm vào file `.env`:
   ```env
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Restart dev server

**Lưu ý**: Nếu không cấu hình OpenAI API key, ứng dụng sẽ tự động sử dụng mock responses và vẫn hoạt động bình thường.

## License

MIT

