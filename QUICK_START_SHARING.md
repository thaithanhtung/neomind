# 🚀 Quick Start - Share Mind Map Feature

## Tóm tắt nhanh

Tính năng này cho phép bạn chia sẻ mind map với người khác ở chế độ **chỉ xem**.

## 📦 Cài đặt (3 bước)

### Bước 1: Chạy Migration

```bash
# Từ thư mục project
./scripts/run-sharing-migration.sh
```

Hoặc chạy manual trong Supabase Dashboard:
- Mở `supabase/migrations/003_add_sharing_feature.sql`
- Copy & paste vào SQL Editor
- Run

### Bước 2: Restart Dev Server

```bash
npm run dev
```

### Bước 3: Test

1. Mở mind map
2. Click nút **"Share"** ở header
3. Click **"Tạo link chia sẻ mới"**
4. Copy link và test!

## 🎯 Cách sử dụng

### Tạo Share Link

```
1. Mở mind map → 2. Click "Share" → 3. "Tạo link mới" → 4. Copy & share!
```

### Quản lý Links

- **📋 Copy**: Click icon copy
- **❌ Vô hiệu hóa**: Disable link tạm thời
- **🗑️ Xóa**: Xóa link vĩnh viễn

### Xem Shared Mind Map

Người nhận chỉ việc mở link → Xem mind map ở chế độ read-only

## ✅ Xong!

Đơn giản vậy thôi. Xem chi tiết trong `README_SHARING.md`

## ⚠️ Lưu ý

- Link có thể xem mà không cần đăng nhập
- Người xem không thể edit/xóa gì cả
- Bạn có thể revoke link bất cứ lúc nào

## 🆘 Cần giúp?

Xem:
- `README_SHARING.md` - Hướng dẫn chi tiết
- `IMPLEMENTATION_SUMMARY.md` - Technical details
