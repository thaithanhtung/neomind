import { useCallback, useRef } from 'react';

interface UseNodeResizeProps {
  nodeId: string;
  initialWidth: number;
  initialHeight: number;
  onResize: (nodeId: string, width: number, height: number) => void;
}

export const useNodeResize = ({
  nodeId,
  initialWidth,
  initialHeight,
  onResize,
}: UseNodeResizeProps) => {
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    position: string;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, position: string) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;

      resizeRef.current = {
        startX,
        startY,
        startWidth: initialWidth,
        startHeight: initialHeight,
        position,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeRef.current) return;

        const deltaX = moveEvent.clientX - resizeRef.current.startX;
        const deltaY = moveEvent.clientY - resizeRef.current.startY;

        let newWidth = resizeRef.current.startWidth;
        let newHeight = resizeRef.current.startHeight;

        const minWidth = 200;
        const minHeight = 100;
        const maxWidth = 800;
        const maxHeight = 600;

        switch (resizeRef.current.position) {
          case 'right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth + deltaX));
            break;
          case 'left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth - deltaX));
            break;
          case 'bottom':
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeRef.current.startHeight + deltaY));
            break;
          case 'top':
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeRef.current.startHeight - deltaY));
            break;
          case 'bottom-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeRef.current.startHeight + deltaY));
            break;
          case 'bottom-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeRef.current.startHeight + deltaY));
            break;
          case 'top-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeRef.current.startHeight - deltaY));
            break;
          case 'top-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeRef.current.startHeight - deltaY));
            break;
        }

        onResize(nodeId, newWidth, newHeight);
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [nodeId, initialWidth, initialHeight, onResize]
  );

  return { handleMouseDown };
};

