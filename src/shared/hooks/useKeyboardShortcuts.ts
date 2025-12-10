import { useEffect } from 'react';

export interface KeyboardShortcuts {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onNewNode?: () => void;
}

/**
 * Hook để xử lý keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chỉ xử lý khi không đang nhập text
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) {
        // Cho phép một số shortcuts trong input
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.key === 'z' || e.key === 'Z' || e.key === 's' || e.key === 'S')
        ) {
          // Cho phép Ctrl+Z, Ctrl+Shift+Z, Ctrl+S trong input
        } else {
          return;
        }
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (shortcuts.onUndo) {
          shortcuts.onUndo();
        }
        return;
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'Z' && e.shiftKey) {
        e.preventDefault();
        if (shortcuts.onRedo) {
          shortcuts.onRedo();
        }
        return;
      }

      // Delete: Xóa node đã chọn
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isInput && shortcuts.onDelete) {
          e.preventDefault();
          shortcuts.onDelete();
        }
        return;
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (shortcuts.onSave) {
          shortcuts.onSave();
        }
        return;
      }

      // Ctrl/Cmd + F: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (shortcuts.onSearch) {
          shortcuts.onSearch();
        }
        return;
      }

      // Ctrl/Cmd + N: New node
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (shortcuts.onNewNode) {
          shortcuts.onNewNode();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
