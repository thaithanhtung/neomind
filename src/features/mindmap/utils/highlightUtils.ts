import { HighlightedText } from '@/features/mindmap/types';
import { HIGHLIGHT_COLORS } from '@/features/mindmap/constants/nodeColors';

export const createHighlightedContent = (
  content: string,
  highlightedTexts: HighlightedText[]
): string => {
  if (!highlightedTexts || highlightedTexts.length === 0) {
    return content;
  }

  // Lấy text content thực tế (không có HTML tags)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const textContent = tempDiv.textContent || '';

  // Sắp xếp highlights theo startIndex (từ cuối lên đầu để thay thế đúng)
  const sortedHighlights = [...highlightedTexts].sort(
    (a, b) => b.startIndex - a.startIndex
  );

  // Render thành HTML - thay thế text được highlight bằng mark tag
  let result = content;
  sortedHighlights.forEach((highlight) => {
    const highlightText = textContent.substring(
      highlight.startIndex,
      highlight.endIndex
    );
    if (highlightText) {
      const colorClass = HIGHLIGHT_COLORS[highlight.level % HIGHLIGHT_COLORS.length];
      const markTag = `<mark class="${colorClass} px-1 rounded">${highlightText}</mark>`;
      // Tìm và thay thế trong HTML content (chỉ thay thế lần đầu tiên tìm thấy)
      const index = result.indexOf(highlightText);
      if (index !== -1) {
        result =
          result.substring(0, index) +
          markTag +
          result.substring(index + highlightText.length);
      }
    }
  });

  return result;
};

