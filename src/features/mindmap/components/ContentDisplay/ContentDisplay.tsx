import { useState, useRef, useCallback } from 'react';
import { SelectedText, HighlightedText } from '@/features/mindmap/types';
import { TextHighlight } from './TextHighlight';
import { AddButton } from './AddButton';
import { PromptModal } from './PromptModal';
import { useTextSelection } from './hooks/useTextSelection';

interface ContentDisplayProps {
  content: string;
  nodeId: string;
  onTextSelected?: (selected: SelectedText, customPrompt?: string) => void;
  highlightedTexts?: HighlightedText[];
}

export const ContentDisplay = ({
  content,
  nodeId,
  onTextSelected,
  highlightedTexts = [],
}: ContentDisplayProps) => {
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [savedSelectedText, setSavedSelectedText] = useState<SelectedText | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCreatingRef = useRef(false);

  const {
    selectedText,
    showAddButton,
    buttonPosition,
    handleCancel: cancelSelection,
  } = useTextSelection({
    content,
    nodeId,
    contentRef,
    modalRef,
  });

  const handleCancel = useCallback(() => {
    setShowPromptModal(false);
    setPrompt('');
    setSavedSelectedText(null);
    cancelSelection();
  }, [cancelSelection]);

  const handleAddButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Lưu selectedText trước khi clear selection
    if (selectedText) {
      setSavedSelectedText(selectedText);
      setPrompt(selectedText.text || '');
      // Xóa text selection sau khi đã lưu
      setTimeout(() => {
        window.getSelection()?.removeAllRanges();
      }, 0);
      setShowPromptModal(true);
    }
  }, [selectedText]);

  const handleCreateNode = useCallback(() => {
    if (isCreatingRef.current) {
      console.log('handleCreateNode: Already creating, skipping...');
      return;
    }

    // Sử dụng savedSelectedText thay vì selectedText vì selectedText có thể đã bị clear
    const textToUse = savedSelectedText || selectedText;
    
    if (!textToUse || !onTextSelected) {
      return;
    }

    isCreatingRef.current = true;

    const finalPrompt = prompt.trim();
    if (finalPrompt.length > 0) {
      onTextSelected(textToUse, finalPrompt);
    } else {
      onTextSelected(textToUse);
    }

    setTimeout(() => {
      isCreatingRef.current = false;
    }, 1000);

    handleCancel();
  }, [savedSelectedText, selectedText, prompt, onTextSelected, handleCancel]);

  return (
    <div
      className='relative w-full h-full'
      onMouseDown={(e) => {
        // Chỉ stopPropagation nếu không phải đang select text
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          // Cho phép text selection hoạt động bình thường
          // Chỉ stopPropagation khi click vào empty space để tránh drag node
          const target = e.target as HTMLElement;
          if (target.tagName !== 'DIV' || target.textContent?.trim() === '') {
            e.stopPropagation();
          }
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
      onMouseUp={() => {
        // Không stopPropagation để cho phép text selection hoàn thành
        // ReactFlow sẽ tự xử lý nếu cần
      }}
    >
      <TextHighlight
        content={content}
        highlightedTexts={highlightedTexts}
        contentRef={contentRef}
        onMouseDown={() => {
          // Không stopPropagation để cho phép text selection
        }}
        onMouseUp={() => {
          // Không làm gì, để text selection hoạt động tự nhiên
        }}
        onClick={(e) => {
          // Chỉ stopPropagation khi click vào empty space
          const selection = window.getSelection();
          if (!selection || selection.toString().length === 0) {
            e.stopPropagation();
          }
        }}
      />

      {showAddButton && selectedText && !showPromptModal && (
        <AddButton position={buttonPosition} onClick={handleAddButtonClick} />
      )}

      {showPromptModal && savedSelectedText && (
        <PromptModal
          selectedText={savedSelectedText}
          prompt={prompt}
          onPromptChange={setPrompt}
          onCreateNode={handleCreateNode}
          onCancel={handleCancel}
          textareaRef={textareaRef}
        />
      )}
    </div>
  );
};

