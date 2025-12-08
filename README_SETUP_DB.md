# Hướng dẫn Setup Database trên Supabase

## Lỗi thường gặp

Nếu bạn gặp lỗi:
```
Error fetching mind maps: {code: 'PGRST205', message: "Could not find the table 'public.mind_maps' in the schema cache"}
```

Điều này có nghĩa là database schema chưa được tạo trên Supabase.

## Giải pháp: Chạy Migration trên Supabase

### Cách 1: Sử dụng SQL Editor (Khuyến nghị)

1. **Truy cập Supabase Dashboard**
   - Vào https://app.supabase.com
   - Chọn project của bạn

2. **Mở SQL Editor**
   - Click vào **SQL Editor** ở sidebar bên trái
   - Click **New Query**

3. **Copy và chạy script**
   - Mở file `supabase/setup_complete.sql` trong project
   - Copy toàn bộ nội dung
   - Paste vào SQL Editor
   - Click **Run** hoặc nhấn `Ctrl+Enter` (Windows/Linux) hoặc `Cmd+Enter` (Mac)

4. **Refresh Schema Cache** (Quan trọng!)
   - Vào **Settings** > **API**
   - Scroll xuống phần **Schema Cache**
   - Click **Refresh Schema Cache** hoặc đợi 1-2 phút để tự động refresh

5. **Kiểm tra kết quả**
   - Vào **Table Editor** trong Supabase Dashboard
   - Bạn sẽ thấy các bảng: `mind_maps`, `nodes`, `edges`, `highlighted_texts`
   - Refresh lại ứng dụng và thử lại

### Cách 2: Chạy từng Migration riêng lẻ

Nếu cách 1 không hoạt động, bạn có thể chạy từng migration:

1. **Migration 001**: Chạy file `supabase/migrations/001_initial_schema.sql`
   - Tạo các bảng và indexes

2. **Migration 002**: Chạy file `supabase/migrations/002_enable_auth_rls.sql`
   - Enable RLS và tạo policies

**Lưu ý**: Migration 002 yêu cầu `user_id` phải là UUID và reference đến `auth.users(id)`. File `setup_complete.sql` đã bao gồm cả hai migrations với cấu hình đúng.

### Cách 3: Sử dụng Supabase CLI (Nâng cao)

Nếu bạn đã cài đặt Supabase CLI:

```bash
# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Kiểm tra Setup

Sau khi chạy migration, kiểm tra:

1. **Tables đã được tạo**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('mind_maps', 'nodes', 'edges', 'highlighted_texts');
   ```

2. **RLS đã được enable**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('mind_maps', 'nodes', 'edges', 'highlighted_texts');
   ```

3. **Policies đã được tạo**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

## Troubleshooting

### Lỗi "relation already exists"
- Các bảng đã tồn tại, có thể bỏ qua hoặc drop và tạo lại
- Nếu muốn reset hoàn toàn:
  ```sql
  DROP TABLE IF EXISTS highlighted_texts CASCADE;
  DROP TABLE IF EXISTS edges CASCADE;
  DROP TABLE IF EXISTS nodes CASCADE;
  DROP TABLE IF EXISTS mind_maps CASCADE;
  ```
  Sau đó chạy lại `setup_complete.sql`

### Lỗi "extension uuid-ossp does not exist"
- Supabase đã có sẵn extension này, có thể bỏ qua dòng `CREATE EXTENSION`

### Schema cache không refresh
- Đợi 1-2 phút
- Hoặc restart Supabase project (Settings > General > Restart)

### Vẫn gặp lỗi sau khi setup
1. Kiểm tra `.env` file có đúng Supabase URL và Anon Key không
2. Restart dev server: `npm run dev`
3. Clear browser cache và reload
4. Kiểm tra console để xem lỗi cụ thể

## Cấu trúc Database

Sau khi setup thành công, bạn sẽ có:

- **mind_maps**: Lưu thông tin mind maps (id, user_id, title, timestamps)
- **nodes**: Lưu các nodes trong mind map (position, size, content, level)
- **edges**: Lưu các kết nối giữa nodes
- **highlighted_texts**: Lưu các text được highlight để tạo node mới

Tất cả đều có RLS (Row Level Security) để đảm bảo user chỉ có thể truy cập data của chính họ.

