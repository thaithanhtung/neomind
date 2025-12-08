# Hướng dẫn Setup Authentication

## Tổng quan

Ứng dụng đã được tích hợp Supabase Authentication với các tính năng:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Lưu trữ data riêng cho mỗi user
- ✅ Row Level Security (RLS) để bảo vệ data

## Bước 1: Enable Authentication trong Supabase

1. Truy cập Supabase Dashboard: https://app.supabase.com
2. Chọn project của bạn
3. Vào **Authentication** > **Providers**
4. Enable **Email** provider (đã được enable mặc định)
5. (Tùy chọn) Cấu hình email templates trong **Authentication** > **Email Templates**

## Bước 2: Chạy Database Migrations

### Migration 1: Initial Schema
```sql
-- Chạy file: supabase/migrations/001_initial_schema.sql
-- Tạo các bảng: mind_maps, nodes, edges, highlighted_texts
```

### Migration 2: Enable RLS và Policies
```sql
-- Chạy file: supabase/migrations/002_enable_auth_rls.sql
-- Enable Row Level Security và tạo policies
```

**Lưu ý quan trọng:**
- Migration 2 sẽ thay đổi `user_id` từ TEXT sang UUID
- Nếu bạn đã có data, cần migrate data trước khi chạy migration 2
- Hoặc xóa tất cả data và chạy lại từ đầu

## Bước 3: Cấu hình Email (Tùy chọn)

### Option 1: Sử dụng Supabase Email (Free tier có giới hạn)
- Supabase sẽ tự động gửi email xác nhận
- Giới hạn: 3 emails/giờ trên free tier

### Option 2: Sử dụng Custom SMTP
1. Vào **Authentication** > **Email Templates**
2. Cấu hình SMTP settings
3. Sử dụng service như SendGrid, Mailgun, etc.

## Bước 4: Test Authentication

1. Chạy ứng dụng: `npm run dev`
2. Bạn sẽ thấy trang đăng nhập/đăng ký
3. Đăng ký tài khoản mới:
   - Nhập email và mật khẩu (tối thiểu 6 ký tự)
   - Kiểm tra email để xác nhận (nếu email confirmation được enable)
4. Đăng nhập với tài khoản vừa tạo
5. Tạo mind map và kiểm tra data được lưu riêng cho user

## Cấu trúc Authentication

### Auth Context
- File: `src/features/auth/context/AuthContext.tsx`
- Quản lý authentication state
- Cung cấp: `signUp`, `signIn`, `signOut`, `user`, `session`

### Components
- `LoginForm`: Form đăng nhập
- `SignupForm`: Form đăng ký
- `AuthPage`: Trang kết hợp login/signup với toggle

### Protected Routes
- App tự động redirect đến `AuthPage` nếu chưa đăng nhập
- Data chỉ được load/save khi user đã đăng nhập

## Row Level Security (RLS)

RLS đảm bảo:
- User chỉ có thể xem/sửa/xóa mind maps của chính họ
- Tất cả các bảng (nodes, edges, highlighted_texts) được bảo vệ thông qua `mind_map_id`

### Policies được tạo:
- **mind_maps**: User chỉ có thể CRUD mind maps của mình
- **nodes**: User chỉ có thể CRUD nodes trong mind maps của mình
- **edges**: User chỉ có thể CRUD edges trong mind maps của mình
- **highlighted_texts**: User chỉ có thể CRUD highlights trong mind maps của mình

## Troubleshooting

### Lỗi "User not authenticated"
- Đảm bảo đã đăng nhập
- Kiểm tra Supabase credentials trong `.env`
- Kiểm tra RLS policies đã được enable chưa

### Email xác nhận không đến
- Kiểm tra spam folder
- Kiểm tra email templates trong Supabase Dashboard
- Nếu dùng free tier, có thể bị giới hạn số lượng email

### Data không được lưu
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra RLS policies
- Kiểm tra console để xem lỗi cụ thể

### Migration lỗi
- Đảm bảo đã chạy migration 1 trước migration 2
- Nếu có data cũ với `user_id` là TEXT, cần migrate data trước
- Hoặc xóa tất cả data và chạy lại từ đầu

## Tính năng nâng cao (Có thể thêm sau)

- [ ] Social login (Google, GitHub, etc.)
- [ ] Password reset
- [ ] Email change
- [ ] Profile management
- [ ] Multiple mind maps per user
- [ ] Share mind maps với người khác
- [ ] Collaboration (realtime editing)

