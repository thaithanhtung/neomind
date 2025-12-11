# Hướng dẫn tính năng Share Mind Map

## Tổng quan

Tính năng Share Mind Map cho phép người dùng chia sẻ mind map của họ với người khác ở chế độ **chỉ xem (read-only)**. Người nhận link có thể xem toàn bộ nội dung nhưng không thể chỉnh sửa gì.

## Các tính năng chính

✅ **Tạo share link**: Tạo link chia sẻ duy nhất cho từng mind map  
✅ **Chế độ chỉ xem**: Người xem không thể chỉnh sửa, kéo thả, hoặc xóa node  
✅ **Quản lý links**: Xem danh sách, copy, vô hiệu hóa, hoặc xóa share links  
✅ **Không cần đăng nhập**: Người nhận link không cần tài khoản để xem  
✅ **Bảo mật**: RLS policies đảm bảo chỉ mind map được share mới truy cập được  

## Cài đặt

### Bước 1: Chạy Migration

Chạy migration SQL để tạo bảng `mind_map_shares` và các RLS policies:

```bash
# Sử dụng Supabase CLI
supabase migration up

# Hoặc chạy trực tiếp file SQL trong Supabase Dashboard
# File: supabase/migrations/003_add_sharing_feature.sql
```

Migration này sẽ:
- Tạo bảng `mind_map_shares` để lưu thông tin share links
- Thêm RLS policies cho phép truy cập shared mind maps
- Update policies hiện có để hỗ trợ shared access

### Bước 2: Verify Migration

Kiểm tra trong Supabase Dashboard:
1. Vào **Database** → **Tables**
2. Xác nhận bảng `mind_map_shares` đã được tạo
3. Vào **Database** → **Policies**
4. Xác nhận các policies mới đã được thêm vào

## Cách sử dụng

### Tạo Share Link

1. Mở mind map bạn muốn chia sẻ
2. Click nút **"Share"** trên header
3. Click **"Tạo link chia sẻ mới (Chỉ xem)"**
4. Link sẽ tự động được copy vào clipboard
5. Chia sẻ link với người khác

### Quản lý Share Links

Trong dialog Share, bạn có thể:

- **📋 Copy link**: Click icon copy để copy link
- **❌ Vô hiệu hóa**: Ngừng cho phép truy cập qua link này
- **🗑️ Xóa**: Xóa hoàn toàn share link khỏi database

### Xem Shared Mind Map

1. Người nhận mở link (format: `https://your-domain.com/shared/{token}`)
2. Mind map sẽ hiển thị ở chế độ read-only
3. Banner cảnh báo sẽ hiển thị: "Chế độ chỉ xem"
4. Không thể:
   - Chỉnh sửa nội dung
   - Kéo thả nodes
   - Tạo node mới
   - Xóa nodes
   - Tạo connections

## Cấu trúc Database

### Bảng `mind_map_shares`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `mind_map_id` | UUID | Reference đến mind_maps |
| `share_token` | TEXT | Token duy nhất cho share link |
| `permission` | TEXT | 'view' hoặc 'edit' (hiện tại chỉ support 'view') |
| `is_active` | BOOLEAN | Link có đang hoạt động không |
| `expires_at` | TIMESTAMPTZ | Ngày hết hạn (nullable) |
| `created_by` | UUID | User tạo share link |
| `created_at` | TIMESTAMPTZ | Thời gian tạo |
| `updated_at` | TIMESTAMPTZ | Thời gian cập nhật |

## API Service Methods

### `createShareLink(mindMapId: string)`

Tạo share link mới cho mind map.

```typescript
const result = await mindMapService.createShareLink(mindMapId);
// Returns: { token: string, url: string }
```

### `getShareLinks(mindMapId: string)`

Lấy tất cả share links của một mind map.

```typescript
const links = await mindMapService.getShareLinks(mindMapId);
// Returns: MindMapShare[]
```

### `loadSharedMindMap(shareToken: string)`

Load mind map từ share token.

```typescript
const data = await mindMapService.loadSharedMindMap(token);
// Returns: { mindMap, nodes, edges, highlightedTexts, systemPrompt, isOwner }
```

### `revokeShareLink(shareToken: string)`

Vô hiệu hóa share link.

```typescript
await mindMapService.revokeShareLink(token);
```

### `deleteShareLink(shareToken: string)`

Xóa share link.

```typescript
await mindMapService.deleteShareLink(token);
```

## Components

### `<ShareButton />`

Component button để tạo và quản lý share links.

```tsx
<ShareButton mindMapId={mindMapId} />
```

### `<SharedMindMapPage />`

Page component để hiển thị shared mind map.

Route: `/shared/:token`

## Security

### RLS Policies

1. **User ownership**: Chỉ owner mới có thể tạo/quản lý share links
2. **Token validation**: Chỉ valid tokens mới cho phép truy cập
3. **Active check**: Share link phải đang active
4. **Expiration**: Kiểm tra expiration date (nếu có)
5. **Read-only**: Người xem không thể modify data

### Best Practices

- ⚠️ Share links là public URL, ai có link đều có thể xem
- ⚠️ Không share link chứa thông tin nhạy cảm
- ✅ Revoke links khi không cần nữa
- ✅ Set expiration date cho temporary shares (tính năng mở rộng)
- ✅ Định kỳ review và xóa links không dùng

## Roadmap / Tính năng mở rộng

- [ ] **Edit permission**: Cho phép người khác edit mind map
- [ ] **Expiration date UI**: Thêm UI để set expiration date
- [ ] **Password protection**: Thêm password cho share link
- [ ] **Analytics**: Track số lượt xem shared mind map
- [ ] **Email invitation**: Gửi email mời xem mind map
- [ ] **QR Code**: Generate QR code cho share link
- [ ] **Custom permissions**: Granular permissions (view nodes, view highlights, etc.)

## Troubleshooting

### Link không hoạt động

1. Kiểm tra link có đang active không
2. Kiểm tra link có hết hạn chưa
3. Verify RLS policies đã được apply đúng
4. Check Supabase logs để xem error details

### Cannot create share link

1. Verify user đã authenticated
2. Verify user là owner của mind map
3. Check Supabase logs để xem permission errors

### Shared mind map không load

1. Verify share token hợp lệ
2. Check RLS policies cho SELECT operations
3. Verify mind map tồn tại và có data

## Support

Nếu gặp vấn đề, kiểm tra:
1. Supabase logs trong Dashboard
2. Browser console logs
3. Network tab để xem API requests

## License

Tính năng này là phần của NeoMind project.
