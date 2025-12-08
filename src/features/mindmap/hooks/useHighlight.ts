import { useMemo } from 'react';
import { HighlightedText } from '@/features/mindmap/types';
import { createHighlightedContent } from '@/features/mindmap/utils/highlightUtils';

export const useHighlight = (
  content: string,
  highlightedTexts: HighlightedText[]
) => {
  const highlightedContent = useMemo(() => {
    return createHighlightedContent(content, highlightedTexts);
  }, [content, highlightedTexts]);

  return highlightedContent;
};

