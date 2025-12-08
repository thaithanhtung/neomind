import { useRef, useEffect } from 'react';
import { ContentDisplay } from '@/features/mindmap/components/ContentDisplay';
import { HighlightedText } from '@/features/mindmap/types';

interface NodeContentProps {
  content: string;
  nodeId: string;
  selected: boolean;
  highlightedTexts: HighlightedText[];
  onTextSelected?: (selected: any, customPrompt?: string) => void;
}

export const NodeContent = ({
  content,
  nodeId,
  selected,
  highlightedTexts,
  onTextSelected,
}: NodeContentProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && textRef.current) {
      textRef.current.style.userSelect = 'text';
      textRef.current.style.webkitUserSelect = 'text';
    } else {
      // Chỉ xóa selection nếu không có text đang được chọn
      // Điều này cho phép user bôi đen text ngay cả khi node không được selected
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();
        
        // Nếu có text đang được chọn trong node này, không xóa
        if (selectedText.length > 0 && textRef.current) {
          const isSelectionInNode =
            textRef.current.contains(range.commonAncestorContainer as Node) ||
            textRef.current.contains(range.startContainer as Node) ||
            textRef.current.contains(range.endContainer as Node);
          
          // Chỉ xóa nếu selection không trong node này
          if (!isSelectionInNode) {
            selection.removeAllRanges();
          }
        } else {
          // Nếu không có text được chọn, xóa selection
          selection.removeAllRanges();
        }
      }
    }
  }, [selected]);

  return (
    <div
      ref={textRef}
      className={`nodrag text-sm h-full overflow-y-auto overflow-x-hidden content-area relative z-20 ${
        selected
          ? 'text-gray-800 bg-white/50 p-2 rounded-md'
          : 'text-gray-600'
      }`}
      style={{
        cursor: 'text',
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text',
      }}
      onMouseDown={(e) => {
        // Chỉ stopPropagation nếu không phải đang select text
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.stopPropagation();
        }
      }}
      onMouseMove={(e) => {
        // Chỉ stopPropagation khi đang drag và có selection
        if (e.buttons === 1) {
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            e.stopPropagation();
          }
        }
      }}
      onMouseUp={(e) => {
        // Không stopPropagation để cho phép text selection hoàn thành
        // Chỉ stopPropagation nếu không có selection để tránh trigger node click
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.stopPropagation();
        }
      }}
    >
      <ContentDisplay
        content={content}
        nodeId={nodeId}
        onTextSelected={onTextSelected}
        highlightedTexts={highlightedTexts}
      />
    </div>
  );
};

