// Hotjar tracking utility
// Hotjar là công cụ phân tích hành vi người dùng với heatmaps, session recordings, và surveys

declare global {
  interface Window {
    hj?: (action: string, ...args: any[]) => void;
    _hjSettings?: {
      hjid: number;
      hjsv: number;
    };
  }
}

/**
 * Khởi tạo Hotjar với Site ID
 * @param siteId - Hotjar Site ID (số nguyên)
 */
export const initHotjar = (siteId: number) => {
  if (!siteId || typeof siteId !== 'number') {
    console.warn('Hotjar Site ID không hợp lệ');
    return;
  }

  // Kiểm tra xem Hotjar đã được load chưa
  if (window.hj) {
    console.warn('Hotjar đã được khởi tạo trước đó');
    return;
  }

  // Tạo script element để load Hotjar
  const script = document.createElement('script');
  script.innerHTML = `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${siteId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
  document.head.appendChild(script);
};

/**
 * Track event trong Hotjar
 * @param eventName - Tên event
 * @param properties - Thuộc tính của event (optional)
 */
export const trackHotjarEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (window.hj) {
    window.hj('event', eventName, properties);
  }
};

/**
 * Identify user trong Hotjar
 * @param userId - User ID
 * @param attributes - Thuộc tính của user (optional)
 */
export const identifyHotjarUser = (
  userId: string,
  attributes?: Record<string, any>
) => {
  if (window.hj) {
    window.hj('identify', userId, attributes);
  }
};

/**
 * State change event (dùng khi route thay đổi trong SPA)
 * @param path - Path mới
 */
export const stateChange = (path: string) => {
  if (window.hj) {
    window.hj('stateChange', path);
  }
};
