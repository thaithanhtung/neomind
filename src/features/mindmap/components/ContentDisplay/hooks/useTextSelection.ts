import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });
  const savedRangeRef = useRef<Range | null>(null);

  const handleCancel = useCallback(() => {
    setShowAddButton(false);
    setSelectedText(null);
    savedRangeRef.current = null;
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
          // Không clear ngay, đợi handleClickOutside xử lý
          return;
        }

        const range = selection.getRangeAt(0);
        const selectedTextValue = range.toString().trim();

        if (selectedTextValue.length === 0) {
          // Không clear ngay, đợi handleClickOutside xử lý
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
        const parentRect = parentElement
          ? parentElement.getBoundingClientRect()
          : contentRect;

        // Tính toán vị trí button relative to parent
        const buttonWidth = 40;
        const buttonHeight = 40;
        const offset = 8;

        // Mặc định đặt button bên phải của selection
        let buttonLeft = rect.right - parentRect.left + offset;
        let buttonTop =
          rect.top - parentRect.top + rect.height / 2 - buttonHeight / 2;

        // Giới hạn trong phạm vi parent element
        const maxLeft =
          parentElement && parentElement instanceof HTMLElement
            ? parentElement.offsetWidth - buttonWidth - offset
            : contentRect.width - buttonWidth - offset;
        const maxTop =
          parentElement && parentElement instanceof HTMLElement
            ? parentElement.offsetHeight - buttonHeight - offset
            : contentRect.height - buttonHeight - offset;

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

        // Lưu range để có thể restore lại nếu bị mất
        savedRangeRef.current = range.cloneRange();

        setShowAddButton(true);

        // Đảm bảo selection vẫn được giữ sau khi button hiển thị
        // Restore selection nếu bị mất do event nào đó
        setTimeout(() => {
          const currentSelection = window.getSelection();
          if (!currentSelection || currentSelection.rangeCount === 0) {
            // Restore selection từ saved range
            if (savedRangeRef.current && contentRef.current) {
              try {
                currentSelection?.removeAllRanges();
                currentSelection?.addRange(savedRangeRef.current.cloneRange());
              } catch (e) {
                // Ignore errors khi restore selection
              }
            }
          }
        }, 100);
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

      // Đợi một chút để đảm bảo text selection đã hoàn thành
      // Tăng delay để tránh conflict với mouseup handler
      setTimeout(() => {
        const selection = window.getSelection();

        // Nếu click bên ngoài contentRef, luôn clear selection và ẩn button
        if (contentRef.current && !contentRef.current.contains(target)) {
          // Kiểm tra lại selection trước khi clear
          if (
            !selection ||
            selection.rangeCount === 0 ||
            selection.toString().trim().length === 0
          ) {
            handleCancel();
          }
          return;
        }

        // Nếu click vào contentRef nhưng không có selection hoặc selection rỗng
        // thì cũng clear selection và ẩn button
        if (contentRef.current && contentRef.current.contains(target)) {
          if (
            !selection ||
            selection.rangeCount === 0 ||
            selection.toString().trim().length === 0
          ) {
            // Chỉ clear nếu không đang trong quá trình drag
            const isDragging =
              (event.target as HTMLElement)?.closest('.react-flow__node') !==
              null;
            if (!isDragging) {
              handleCancel();
            }
          }
        }
      }, 200); // Tăng delay để tránh conflict với mouseup handler
    };

    // Sử dụng capture phase để handle trước
    document.addEventListener('mouseup', handleMouseUp, true);
    // Sử dụng click với delay để không conflict với mouseup và text selection
    document.addEventListener('click', handleClickOutside, false);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, [nodeId, content, handleCancel, contentRef, modalRef, showAddButton]);

  useEffect(() => {
    if (showAddButton && contentRef.current) {
      // Đảm bảo selection được giữ khi button hiển thị
      const preserveSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          // Restore selection từ saved range nếu bị mất
          if (savedRangeRef.current) {
            try {
              selection?.removeAllRanges();
              selection?.addRange(savedRangeRef.current.cloneRange());
            } catch (e) {
              // Ignore errors khi restore selection
            }
          }
        }
      };

      const updatePosition = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const contentRect = contentRef.current!.getBoundingClientRect();

          // Tính toán lại vị trí với logic tương tự
          const parentElement = contentRef.current!.closest('.relative');
          const parentRect = parentElement
            ? parentElement.getBoundingClientRect()
            : contentRect;

          const buttonWidth = 40;
          const buttonHeight = 40;
          const offset = 8;

          let buttonLeft = rect.right - parentRect.left + offset;
          let buttonTop =
            rect.top - parentRect.top + rect.height / 2 - buttonHeight / 2;

          const maxLeft =
            parentElement && parentElement instanceof HTMLElement
              ? parentElement.offsetWidth - buttonWidth - offset
              : contentRect.width - buttonWidth - offset;
          const maxTop =
            parentElement && parentElement instanceof HTMLElement
              ? parentElement.offsetHeight - buttonHeight - offset
              : contentRect.height - buttonHeight - offset;

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
        } else {
          // Nếu selection bị mất, restore lại
          preserveSelection();
        }
      };

      // Kiểm tra và preserve selection định kỳ khi button hiển thị
      const intervalId = setInterval(preserveSelection, 100);

      const scrollContainer = contentRef.current.closest('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updatePosition);
        return () => {
          clearInterval(intervalId);
          scrollContainer.removeEventListener('scroll', updatePosition);
        };
      }

      return () => {
        clearInterval(intervalId);
      };
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
