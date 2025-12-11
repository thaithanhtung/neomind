import { TourStep } from '../hooks/useTour';

/**
 * Các bước hướng dẫn cho trang danh sách mind maps
 */
export const mindMapListTourSteps: TourStep[] = [
  {
    element: '[data-tour="header-title"]',
    intro:
      'Chào mừng đến với NeoMind! Đây là nơi bạn quản lý tất cả các sơ đồ tư duy của mình.',
    position: 'bottom',
  },
  {
    element: '[data-tour="create-button"]',
    intro:
      'Nhấn vào đây để tạo mind map mới. Bạn có thể tạo nhiều mind map cho các chủ đề khác nhau.',
    position: 'bottom',
  },
  {
    element: '[data-tour="mindmap-card"]',
    intro:
      'Đây là danh sách các mind map của bạn. Nhấn vào một card để mở và chỉnh sửa.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-menu"]',
    intro: 'Nhấn vào menu (3 chấm) để đổi tên hoặc xóa mind map.',
    position: 'left',
  },
];

/**
 * Các bước hướng dẫn cho trang chi tiết mind map
 */
export const mindMapDetailTourSteps: TourStep[] = [
  {
    element: '[data-tour="header"]',
    intro:
      'Chào mừng đến với NeoMind! Đây là giao diện chỉnh sửa mind map. Bạn sẽ học cách tạo và mở rộng sơ đồ tư duy.',
    position: 'bottom',
  },
  {
    element: '[data-tour="tags-section"]',
    intro:
      'Tags: Thêm tags để phân loại và tìm kiếm mind map dễ dàng hơn. Click vào header để mở/đóng phần này.',
    position: 'bottom',
  },
  {
    element: '[data-tour="system-prompt-section"]',
    intro:
      'System Prompt: Tùy chỉnh cách AI tạo nội dung cho mind map này. Bạn có thể đặt prompt riêng để AI hiểu rõ hơn về chủ đề của bạn. Click vào header để mở/đóng.',
    position: 'bottom',
  },
  {
    element: '[data-tour="topic-input"]',
    intro:
      'Bước 1: Tạo node đầu tiên - Nhập chủ đề hoặc câu hỏi vào đây (ví dụ: "React là gì?"). Sau đó nhấn Enter hoặc nút Send. AI sẽ tạo nội dung giải thích chi tiết và hiển thị trong một node mới.',
    position: 'bottom',
  },
  {
    element: '[data-tour="topic-input-field"]',
    intro:
      'Đây là ô nhập liệu. Bạn có thể nhập bất kỳ chủ đề nào bạn muốn tìm hiểu. Hãy thử nhập một câu hỏi hoặc chủ đề!',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Sau khi tạo node đầu tiên, node sẽ xuất hiện ở đây. Bạn có thể kéo thả node, zoom in/out bằng chuột giữa hoặc trackpad.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Bước 2: Tạo node con từ text - Sau khi có node đầu tiên, click vào node để chọn nó (bạn sẽ thấy viền xanh và badge "Text selectable"). Sau đó bôi đen từ hoặc cụm từ trong nội dung mà bạn muốn tìm hiểu thêm.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Khi bạn bôi đen text trong node, một nút "+" màu xanh sẽ xuất hiện. Nhấn vào nút đó để mở hộp thoại tạo node con. Bạn có thể nhập câu hỏi tùy chỉnh hoặc để trống để AI tự động tạo nội dung.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Bước 3: Tạo node bằng double-click - Bạn có thể double-click vào bất kỳ vị trí nào trên canvas để tạo node mới tại vị trí đó. Một hộp thoại sẽ xuất hiện để nhập tên node.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Bước 4: Kết nối các node - Sau khi có nhiều node, bạn có thể kết nối chúng bằng cách kéo từ handle ở đáy node này đến handle ở đỉnh node khác. Mỗi node có handle màu xanh để kết nối.',
    position: 'top',
  },
  {
    element: '[data-tour="back-button"]',
    intro: 'Nhấn vào đây để quay lại danh sách mind maps.',
    position: 'bottom',
  },
];

/**
 * Các bước hướng dẫn cho trang chi tiết mind map (khi đã có nodes)
 */
export const mindMapDetailWithNodesTourSteps: TourStep[] = [
  {
    element: '[data-tour="header"]',
    intro:
      'Bạn đã có node trong mind map! Bây giờ bạn sẽ học cách mở rộng sơ đồ bằng nhiều cách khác nhau.',
    position: 'bottom',
  },
  {
    element: '[data-tour="tags-section"]',
    intro:
      'Tags: Thêm tags để phân loại và tìm kiếm mind map dễ dàng hơn. Click vào header để mở/đóng phần này.',
    position: 'bottom',
  },
  {
    element: '[data-tour="system-prompt-section"]',
    intro:
      'System Prompt: Tùy chỉnh cách AI tạo nội dung cho mind map này. Bạn có thể đặt prompt riêng để AI hiểu rõ hơn về chủ đề của bạn. Click vào header để mở/đóng.',
    position: 'bottom',
  },
  {
    element: '[data-tour="node-content"]',
    intro:
      'Bước 1: Tạo node con từ text - Click vào một node để chọn nó (bạn sẽ thấy viền xanh và badge "Text selectable"). Sau đó bôi đen từ hoặc cụm từ trong nội dung mà bạn muốn tìm hiểu thêm.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Sau khi bôi đen text, một nút "+" màu xanh sẽ xuất hiện gần vị trí text bạn chọn. Nhấn vào nút đó để mở hộp thoại tạo node con. Bạn có thể nhập câu hỏi tùy chỉnh hoặc để trống để AI tự động tạo nội dung.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Bước 2: Tạo node bằng double-click - Bạn có thể double-click vào bất kỳ vị trí nào trên canvas để tạo node mới tại vị trí đó. Một hộp thoại sẽ xuất hiện để nhập tên node.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Bước 3: Kết nối các node - Mỗi node có 2 handle: handle ở đáy (màu xanh) là điểm xuất phát, handle ở đỉnh là điểm đích. Kéo từ handle đáy của node này đến handle đỉnh của node khác để tạo kết nối.',
    position: 'top',
  },
  {
    element: '[data-tour="mindmap-canvas"]',
    intro:
      'Canvas của mind map. Bạn có thể kéo thả các node, zoom in/out bằng chuột giữa hoặc trackpad. Tiếp tục mở rộng sơ đồ bằng nhiều cách: chọn text, double-click, hoặc kết nối các node.',
    position: 'top',
  },
  {
    element: '[data-tour="back-button"]',
    intro: 'Nhấn vào đây để quay lại danh sách mind maps.',
    position: 'bottom',
  },
];
