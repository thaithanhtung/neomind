import { memo } from 'react';

interface ResizeHandleProps {
  position: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onMouseDown: (e: React.MouseEvent, position: string) => void;
}

export const ResizeHandle = memo(({ position, onMouseDown }: ResizeHandleProps) => {
  const getCursorClass = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return 'cursor-ns-resize';
      case 'left':
      case 'right':
        return 'cursor-ew-resize';
      case 'top-left':
      case 'bottom-right':
        return 'cursor-nwse-resize';
      case 'top-right':
      case 'bottom-left':
        return 'cursor-nesw-resize';
      default:
        return 'cursor-default';
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2 w-full h-2';
      case 'right':
        return 'right-0 top-1/2 -translate-y-1/2 w-2 h-full';
      case 'bottom':
        return 'bottom-0 left-1/2 -translate-x-1/2 w-full h-2';
      case 'left':
        return 'left-0 top-1/2 -translate-y-1/2 w-2 h-full';
      case 'top-left':
        return 'top-0 left-0 w-4 h-4';
      case 'top-right':
        return 'top-0 right-0 w-4 h-4';
      case 'bottom-left':
        return 'bottom-0 left-0 w-4 h-4';
      case 'bottom-right':
        return 'bottom-0 right-0 w-4 h-4';
      default:
        return '';
    }
  };

  return (
    <div
      className={`absolute ${getPositionClass()} ${getCursorClass()} bg-blue-500 opacity-0 hover:opacity-80 transition-opacity z-50 nodrag group`}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onMouseDown(e, position);
      }}
      style={{
        touchAction: 'none',
      }}
    >
      {/* Corner handles có thêm border để dễ nhìn */}
      {(position.includes('left') || position.includes('right')) &&
        (position.includes('top') || position.includes('bottom')) && (
          <div className='absolute inset-0 border-2 border-blue-600 rounded-sm' />
        )}
    </div>
  );
});

ResizeHandle.displayName = 'ResizeHandle';

