import { useHighlight } from '@/features/mindmap/hooks/useHighlight';
import { HighlightedText } from '@/features/mindmap/types';

interface TextHighlightProps {
  content: string;
  highlightedTexts: HighlightedText[];
  nodeId: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export const TextHighlight = ({
  content,
  highlightedTexts,
  contentRef,
  onMouseDown,
  onMouseUp,
  onClick,
}: Omit<TextHighlightProps, 'nodeId'>) => {
  const highlightedContent = useHighlight(content, highlightedTexts);

  return (
    <div
      ref={contentRef}
      className='nodrag prose prose-sm max-w-none text-gray-700 leading-relaxed select-text cursor-text selection:bg-blue-200 selection:text-blue-900'
      style={{
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text',
        pointerEvents: 'auto',
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
    />
  );
};

