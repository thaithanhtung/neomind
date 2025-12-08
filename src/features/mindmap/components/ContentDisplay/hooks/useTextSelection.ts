import { useState, useEffect, useCallback } from 'react';
import { SelectedText } from '@/features/mindmap/types';

interface UseTextSelectionProps {
  content: string;
  nodeId: string;
  contentRef: React.RefObject<HTMLDivElement>;
  modalRef: React.RefObject<HTMLDivElement>;
}

export const useTextSelection = ({
  content,
  nodeId,
  contentRef,
  modalRef,
}: UseTextSelectionProps) => {
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [showAddButton, setShowAddButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const handleCancel = useCallback(() => {
    setShowAddButton(false);
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      // Delay để đảm bảo selection đã được set
      setTimeout(() => {
        if (!contentRef.current) {
          setShowAddButton(false);
          return;
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          setShowAddButton(false);
          setSelectedText(null);
          return;
        }

        const range = selection.getRangeAt(0);
        const selectedTextValue = range.toString().trim();

        if (selectedTextValue.length === 0) {
          setShowAddButton(false);
          setSelectedText(null);
          return;
        }

        // Kiểm tra xem selection có trong contentRef không
        const isInContent =
          contentRef.current.contains(range.commonAncestorContainer) ||
          contentRef.current.contains(range.startContainer) ||
          contentRef.current.contains(range.endContainer) ||
          (event.target && contentRef.current.contains(event.target as Node));

        if (!isInContent) {
          setShowAddButton(false);
          setSelectedText(null);
          return;
        }

        // Tính toán vị trí button với logic cải thiện
        const rect = range.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        // Tìm parent element có position relative (ContentDisplay wrapper)
        const parentElement = contentRef.current.closest('.relative');
        const parentRect = parentElement ? parentElement.getBoundingClientRect() : contentRect;
        
        // Tính toán vị trí button relative to parent
        const buttonWidth = 40;
        const buttonHeight = 40;
        const offset = 8;
        
        // Mặc định đặt button bên phải của selection
        let buttonLeft = rect.right - parentRect.left + offset;
        let buttonTop = rect.top - parentRect.top + (rect.height / 2) - (buttonHeight / 2);
        
        // Giới hạn trong phạm vi parent element
        const maxLeft = parentElement ? parentElement.offsetWidth - buttonWidth - offset : contentRect.width - buttonWidth - offset;
        const maxTop = parentElement ? parentElement.offsetHeight - buttonHeight - offset : contentRect.height - buttonHeight - offset;
        
        // Kiểm tra nếu button tràn ra ngoài bên phải
        if (buttonLeft > maxLeft) {
          // Đặt button ở bên trái của selection
          buttonLeft = rect.left - parentRect.left - buttonWidth - offset;
        }
        
        // Kiểm tra nếu button tràn ra ngoài bên trái
        if (buttonLeft < offset) {
          buttonLeft = offset;
        }
        
        // Kiểm tra và điều chỉnh vị trí dọc
        if (buttonTop < offset) {
          buttonTop = rect.bottom - parentRect.top + offset;
        }
        
        if (buttonTop > maxTop) {
          buttonTop = rect.top - parentRect.top - buttonHeight - offset;
        }
        
        // Đảm bảo button luôn nằm trong viewport
        buttonTop = Math.max(offset, Math.min(buttonTop, maxTop));
        buttonLeft = Math.max(offset, Math.min(buttonLeft, maxLeft));

        setButtonPosition({
          top: buttonTop,
          left: buttonLeft,
        });

        // Tính toán startIndex và endIndex
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || '';

        const startIndex = textContent.indexOf(selectedTextValue);
        const endIndex = startIndex + selectedTextValue.length;

        setSelectedText({
          text: selectedTextValue,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex: endIndex >= 0 ? endIndex : selectedTextValue.length,
          nodeId,
        });

        setShowAddButton(true);
      }, 50); // Giảm delay xuống 50ms
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Không clear nếu click vào modal
      if (modalRef.current && modalRef.current.contains(target)) {
        return;
      }

      // Không clear nếu click vào AddButton (kiểm tra nhiều cách)
      const element = target as HTMLElement;
      if (
        element.closest('button[class*="bg-gradient"]') ||
        element.closest('button[class*="from-blue-500"]') ||
        element.closest('button[class*="rounded-full"]') ||
        element.closest('[data-add-button="true"]')
      ) {
        return;
      }

      // Không clear nếu đang có selection trong content
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (
          range.toString().trim().length > 0 &&
          contentRef.current &&
          (contentRef.current.contains(range.commonAncestorContainer) ||
            contentRef.current.contains(range.startContainer) ||
            contentRef.current.contains(range.endContainer))
        ) {
          return;
        }
      }

      // Chỉ clear nếu click bên ngoài contentRef và không phải đang select text
      if (contentRef.current && !contentRef.current.contains(target)) {
        // Đợi một chút để đảm bảo text selection đã hoàn thành
        setTimeout(() => {
          const currentSelection = window.getSelection();
          if (!currentSelection || currentSelection.rangeCount === 0) {
            handleCancel();
          }
        }, 100);
      }
    };

    // Sử dụng capture phase để handle trước
    document.addEventListener('mouseup', handleMouseUp, true);
    // Sử dụng timeout để không conflict với mouseup
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [nodeId, content, handleCancel, contentRef, modalRef]);

  useEffect(() => {
    if (showAddButton && contentRef.current) {
      const updatePosition = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const contentRect = contentRef.current!.getBoundingClientRect();

          // Tính toán lại vị trí với logic tương tự
          const parentElement = contentRef.current!.closest('.relative');
          const parentRect = parentElement ? parentElement.getBoundingClientRect() : contentRect;
          
          const buttonWidth = 40;
          const buttonHeight = 40;
          const offset = 8;
          
          let buttonLeft = rect.right - parentRect.left + offset;
          let buttonTop = rect.top - parentRect.top + (rect.height / 2) - (buttonHeight / 2);
          
          const maxLeft = parentElement ? parentElement.offsetWidth - buttonWidth - offset : contentRect.width - buttonWidth - offset;
          const maxTop = parentElement ? parentElement.offsetHeight - buttonHeight - offset : contentRect.height - buttonHeight - offset;
          
          if (buttonLeft > maxLeft) {
            buttonLeft = rect.left - parentRect.left - buttonWidth - offset;
          }
          
          if (buttonLeft < offset) {
            buttonLeft = offset;
          }
          
          if (buttonTop < offset) {
            buttonTop = rect.bottom - parentRect.top + offset;
          }
          
          if (buttonTop > maxTop) {
            buttonTop = rect.top - parentRect.top - buttonHeight - offset;
          }
          
          buttonTop = Math.max(offset, Math.min(buttonTop, maxTop));
          buttonLeft = Math.max(offset, Math.min(buttonLeft, maxLeft));

          setButtonPosition({
            top: buttonTop,
            left: buttonLeft,
          });
        }
      };

      const scrollContainer = contentRef.current.closest('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updatePosition);
        return () =>
          scrollContainer.removeEventListener('scroll', updatePosition);
      }
    }
  }, [showAddButton, contentRef]);

  return {
    selectedText,
    showAddButton,
    buttonPosition,
    handleCancel,
    setShowAddButton,
    setSelectedText,
  };
};

