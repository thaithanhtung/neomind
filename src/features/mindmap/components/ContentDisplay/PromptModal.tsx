import { Plus, X, Sparkles, MessageSquare } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { SelectedText } from '@/features/mindmap/types';

interface PromptModalProps {
  selectedText: SelectedText;
  prompt: string;
  onPromptChange: (value: string) => void;
  onCreateNode: () => void;
  onCancel: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const PromptModal = ({
  selectedText,
  prompt,
  onPromptChange,
  onCreateNode,
  onCancel,
  textareaRef,
}: PromptModalProps) => {
  // Hàm để focus vào textarea
  const focusTextarea = useCallback(() => {
    if (textareaRef.current) {
      // Xóa text selection nếu còn
      window.getSelection()?.removeAllRanges();
      // Focus vào textarea
      textareaRef.current.focus();
      // Đặt cursor ở cuối
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [textareaRef]);

  // Focus vào textarea khi modal mở
  useEffect(() => {
    // Đợi một chút để đảm bảo modal đã render hoàn toàn
    const timer = setTimeout(() => {
      focusTextarea();
    }, 150);

    return () => clearTimeout(timer);
  }, [focusTextarea]);

  // Focus lại khi click vào modal
  const handleModalClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Focus lại textarea khi click vào modal
      setTimeout(() => {
        focusTextarea();
      }, 0);
    },
    [focusTextarea]
  );

  return (
    <div
      className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn'
      onClick={handleModalClick}
    >
      <div
        className='bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-6 min-w-[450px] max-w-[550px] mx-4 transform animate-fadeIn'
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-5'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-800'>Tạo node mới</h3>
            </div>
            <button
              onClick={onCancel}
              className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <div className='mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50'>
            <div className='flex items-start gap-2'>
              <MessageSquare className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-xs font-medium text-blue-700 mb-1.5'>
                  Text đã chọn:
                </p>
                <p className='text-sm font-semibold text-gray-800 break-words leading-relaxed'>
                  "{selectedText.text}"
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2.5'>
              Nhập câu hỏi hoặc prompt về text đã chọn:
            </label>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder='Ví dụ: Giải thích chi tiết về...'
              className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none text-sm resize-none transition-all duration-200 placeholder:text-gray-400'
              rows={4}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onCancel();
                } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onCreateNode();
                }
              }}
              onFocus={(e) => {
                // Đảm bảo cursor ở cuối khi focus
                const length = e.currentTarget.value.length;
                e.currentTarget.setSelectionRange(length, length);
              }}
              onMouseDown={(e) => {
                // Đảm bảo focus khi click vào textarea
                e.stopPropagation();
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }, 0);
              }}
              onClick={(e) => {
                // Đảm bảo focus khi click vào textarea
                e.stopPropagation();
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }}
            />
          </div>
        </div>
        <div className='flex gap-3 justify-end pt-2'>
          <button
            onClick={onCancel}
            className='px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-semibold text-gray-700'
          >
            Hủy
          </button>
          <button
            onClick={onCreateNode}
            className='group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'
          >
            <Plus className='w-4 h-4 transition-transform duration-300 group-hover:rotate-90' />
            Tạo node
          </button>
        </div>
      </div>
    </div>
  );
};
