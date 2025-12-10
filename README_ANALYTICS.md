# Hướng dẫn cấu hình Google Analytics

Dự án này đã được tích hợp Google Analytics để theo dõi người dùng và các thao tác của họ.

## Cài đặt

1. **Tạo Google Analytics 4 Property:**
   - Truy cập [Google Analytics](https://analytics.google.com/)
   - Tạo một property mới (nếu chưa có)
   - Lấy Measurement ID (có dạng `G-XXXXXXXXXX`)

2. **Thêm Measurement ID vào file `.env`:**
   ```bash
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Khởi động lại ứng dụng:**
   ```bash
   npm run dev
   ```

## Các sự kiện được theo dõi

### User Events
- `user_login` - Khi người dùng đăng nhập
- `user_signup` - Khi người dùng đăng ký
- `user_logout` - Khi người dùng đăng xuất

### Mind Map Events
- `mindmap_create` - Khi tạo mind map mới
- `mindmap_delete` - Khi xóa mind map
- `mindmap_select` - Khi chọn một mind map
- `mindmap_view` - Khi xem chi tiết mind map

### Node Events
- `node_create` - Khi tạo node mới (từ topic input hoặc text selection)
- `node_delete` - Khi xóa node
- `node_click` - Khi click vào node
- `node_resize` - Khi resize node (tự động track khi node thay đổi kích thước)
- `node_connect` - Khi kết nối 2 node với nhau

### Content Events
- `text_select` - Khi chọn text trong node content
- `text_highlight` - Khi highlight text
- `topic_submit` - Khi submit topic để tạo node mới

### UI Events
- `input_toggle` - Khi toggle input box
- `mindmap_list_view` - Khi xem danh sách mind maps

## Page Views

Tất cả các page views được tự động track khi người dùng điều hướng giữa các trang:
- `/` - Trang danh sách mind maps
- `/mindmaps/:id` - Trang chi tiết mind map

## Xem dữ liệu trong Google Analytics

1. Đăng nhập vào [Google Analytics Dashboard](https://analytics.google.com/)
2. Chọn property của bạn
3. Vào **Reports** > **Engagement** > **Events** để xem các events
4. Vào **Reports** > **Engagement** > **Pages and screens** để xem page views

## Lưu ý

- Google Analytics chỉ hoạt động khi có `VITE_GA_MEASUREMENT_ID` trong file `.env`
- Nếu không có Measurement ID, ứng dụng vẫn hoạt động bình thường nhưng không track events
- Dữ liệu có thể mất vài phút để xuất hiện trong Google Analytics dashboard
