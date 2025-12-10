# Hướng dẫn cấu hình Hotjar

Dự án này đã được tích hợp Hotjar để theo dõi hành vi người dùng với heatmaps, session recordings, và surveys.

## Cài đặt

1. **Tạo Hotjar Account:**
   - Truy cập [Hotjar](https://www.hotjar.com/)
   - Đăng ký tài khoản miễn phí hoặc trả phí
   - Tạo một Site mới trong dashboard

2. **Lấy Site ID:**
   - Trong Hotjar dashboard, vào **Settings** > **Tracking Code**
   - Copy Site ID (là một số nguyên, ví dụ: `1234567`)

3. **Thêm Site ID vào file `.env`:**
   ```bash
   VITE_HOTJAR_SITE_ID=1234567
   ```

4. **Khởi động lại ứng dụng:**
   ```bash
   npm run dev
   ```

## Tính năng Hotjar

### 1. Heatmaps
- **Click Heatmaps**: Xem người dùng click vào đâu trên trang
- **Move Heatmaps**: Xem người dùng di chuyển chuột như thế nào
- **Scroll Heatmaps**: Xem người dùng scroll đến đâu trên trang

### 2. Session Recordings
- Ghi lại toàn bộ phiên làm việc của người dùng
- Xem lại các thao tác, clicks, scrolls, và navigation
- Hữu ích để debug và hiểu cách người dùng sử dụng ứng dụng

### 3. Surveys & Feedback
- Tạo surveys để thu thập feedback từ người dùng
- Có thể trigger surveys dựa trên các điều kiện cụ thể

### 4. User Identification
- Tự động identify user khi đăng nhập/đăng ký
- Cho phép filter recordings và heatmaps theo user cụ thể

## Các sự kiện được theo dõi

### User Events
- `user_login` - Khi người dùng đăng nhập (kèm email)
- `user_signup` - Khi người dùng đăng ký (kèm email)

### Navigation Events
- Tự động track state changes khi người dùng điều hướng giữa các trang trong SPA

## User Identification

Khi người dùng đăng nhập hoặc đăng ký thành công, hệ thống sẽ tự động:
- Identify user trong Hotjar với User ID và email
- Cho phép bạn filter và phân tích dữ liệu theo user cụ thể

## Xem dữ liệu trong Hotjar

1. Đăng nhập vào [Hotjar Dashboard](https://insights.hotjar.com/)
2. Chọn Site của bạn
3. Xem các tính năng:
   - **Heatmaps**: Xem heatmaps cho từng trang
   - **Recordings**: Xem session recordings của người dùng
   - **Surveys**: Xem kết quả surveys
   - **Funnels**: Phân tích conversion funnels
   - **Polls**: Xem kết quả polls

## Lưu ý

- Hotjar chỉ hoạt động khi có `VITE_HOTJAR_SITE_ID` hợp lệ trong file `.env`
- Hotjar script được load asynchronously để không ảnh hưởng đến performance
- User identification chỉ hoạt động khi user đăng nhập/đăng ký thành công
- State changes được tự động track khi route thay đổi trong SPA

## Privacy & GDPR

Hotjar tuân thủ GDPR và có các tính năng để bảo vệ quyền riêng tư:
- Có thể mask sensitive data trong recordings
- Có thể block specific elements khỏi tracking
- User có thể opt-out thông qua Hotjar's opt-out page
