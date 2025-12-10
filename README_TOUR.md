# Hướng dẫn Tour với Intro.js

Dự án đã được tích hợp Intro.js để tạo tour hướng dẫn cho người dùng mới.

## Tính năng

- ✅ Tour hướng dẫn cho trang danh sách mind maps
- ✅ Tour hướng dẫn cho trang chi tiết mind map
- ✅ Nút "Hướng dẫn" trong Header để bắt đầu tour
- ✅ Lưu trạng thái đã hoàn thành tour vào localStorage
- ✅ Giao diện đẹp với CSS tùy chỉnh

## Cách sử dụng

### Cho người dùng

1. **Bắt đầu tour từ Header:**
   - Nhấn vào nút "Hướng dẫn" (biểu tượng dấu hỏi) ở góc trên bên phải
   - Tour sẽ tự động hướng dẫn bạn qua các tính năng chính

2. **Tour trang danh sách mind maps:**
   - Giới thiệu về giao diện
   - Cách tạo mind map mới
   - Cách quản lý mind maps (đổi tên, xóa)

3. **Tour trang chi tiết mind map:**
   - Cách nhập topic để tạo node
   - Cách tương tác với canvas
   - Cách mở rộng sơ đồ bằng cách chọn text

### Cho developer

#### Thêm tour mới

1. **Tạo tour steps trong `src/shared/utils/tourSteps.ts`:**

```typescript
export const myNewTourSteps: TourStep[] = [
  {
    element: '[data-tour="my-element"]',
    intro: 'Mô tả về element này',
    position: 'bottom',
  },
];
```

2. **Thêm data-tour attribute vào component:**

```tsx
<div data-tour="my-element">
  {/* Your component */}
</div>
```

3. **Sử dụng hook trong component:**

```tsx
import { useTour } from '@/shared/hooks/useTour';
import { myNewTourSteps } from '@/shared/utils/tourSteps';

const MyComponent = () => {
  const { startTour } = useTour('my-tour-id');

  const handleStartTour = () => {
    startTour({
      steps: myNewTourSteps,
    });
  };

  return (
    <button onClick={handleStartTour}>
      Bắt đầu tour
    </button>
  );
};
```

#### Quản lý trạng thái tour

- Tour đã hoàn thành được lưu trong `localStorage` với key `neomind_tours_completed`
- Để reset tour (cho phép xem lại):
  ```typescript
  const { resetTour } = useTour('tour-id');
  resetTour();
  ```

## Cấu trúc files

```
src/
├── shared/
│   ├── hooks/
│   │   └── useTour.ts          # Hook quản lý tour
│   └── utils/
│       └── tourSteps.ts         # Định nghĩa các bước tour
├── pages/
│   ├── MindMapListPage.tsx     # Tích hợp tour cho list page
│   └── MindMapDetailPage.tsx   # Tích hợp tour cho detail page
└── shared/components/
    └── Header/
        └── Header.tsx           # Nút "Hướng dẫn"
```

## Tùy chỉnh CSS

CSS tùy chỉnh cho Intro.js được định nghĩa trong `src/index.css`. Bạn có thể chỉnh sửa:

- Màu sắc tooltip
- Kích thước và spacing
- Hiệu ứng hover
- Animation

## Lưu ý

- Tour chỉ hiển thị khi các element có `data-tour` attribute đã được render
- Nếu element không tồn tại, Intro.js sẽ tự động bỏ qua bước đó
- Tour có thể được bắt đầu lại bất cứ lúc nào bằng nút "Hướng dẫn"
