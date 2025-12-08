import { useState, useCallback, useRef } from 'react';

const RESIZE_THRESHOLD = 8; // Khoảng cách từ biên để detect resize (px)

export const useResizeCursor = () => {
  const [cursor, setCursor] = useState<string>('default');
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!nodeRef.current) return;

    const rect = nodeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Kiểm tra xem có đang ở gần biên không
    const nearTop = y < RESIZE_THRESHOLD;
    const nearBottom = y > height - RESIZE_THRESHOLD;
    const nearLeft = x < RESIZE_THRESHOLD;
    const nearRight = x > width - RESIZE_THRESHOLD;

    // Xác định cursor dựa trên vị trí
    if (nearTop && nearLeft) {
      setCursor('nwse-resize');
    } else if (nearTop && nearRight) {
      setCursor('nesw-resize');
    } else if (nearBottom && nearLeft) {
      setCursor('nesw-resize');
    } else if (nearBottom && nearRight) {
      setCursor('nwse-resize');
    } else if (nearTop || nearBottom) {
      setCursor('ns-resize');
    } else if (nearLeft || nearRight) {
      setCursor('ew-resize');
    } else {
      setCursor('default');
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursor('default');
  }, []);

  return {
    cursor,
    nodeRef,
    handleMouseMove,
    handleMouseLeave,
  };
};

