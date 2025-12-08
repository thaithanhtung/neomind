# Hướng dẫn Setup Supabase

## Bước 1: Tạo Supabase Project

1. Truy cập https://app.supabase.com và đăng nhập
2. Tạo project mới
3. Lưu lại **Project URL** và **anon/public key** từ Settings > API

## Bước 2: Setup Database Schema

1. Vào SQL Editor trong Supabase Dashboard
2. Copy nội dung từ file `supabase/migrations/001_initial_schema.sql`
3. Paste vào SQL Editor và chạy (Run)

Hoặc sử dụng Supabase CLI:
```bash
supabase db push
```

## Bước 3: Cấu hình Environment Variables

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Mở file `.env` và điền thông tin Supabase:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Bước 4: Chạy ứng dụng

```bash
npm run dev
```

## Cấu trúc Database

### Tables:
- **mind_maps**: Lưu thông tin mind maps
- **nodes**: Lưu các nodes trong mind map
- **edges**: Lưu các kết nối giữa nodes
- **highlighted_texts**: Lưu các text được highlight để tạo node mới

### Features:
- ✅ Auto-save: Tự động lưu khi có thay đổi (debounce 1s)
- ✅ Auto-load: Tự động load data khi mở app
- ✅ Single mind map: Mỗi user có 1 mind map mặc định
- ✅ Anonymous access: Hoạt động không cần đăng nhập (có thể thêm auth sau)

## Lưu ý

- Hiện tại RLS (Row Level Security) đã được disable để cho phép anonymous access
- Khi thêm authentication, cần enable RLS và uncomment các policies trong migration file
- Data sẽ được tự động lưu sau mỗi thay đổi 1 giây
- Nếu không có Supabase config, app vẫn hoạt động nhưng không lưu data

## Troubleshooting

### Lỗi "Supabase credentials not found"
- Kiểm tra file `.env` đã được tạo chưa
- Đảm bảo các biến môi trường bắt đầu với `VITE_`
- Restart dev server sau khi thay đổi `.env`

### Lỗi khi chạy SQL migration
- Kiểm tra đã enable extension `uuid-ossp` chưa
- Đảm bảo có quyền tạo tables trong database

### Data không được lưu
- Kiểm tra console để xem có lỗi gì không
- Đảm bảo Supabase credentials đúng
- Kiểm tra network tab trong DevTools

