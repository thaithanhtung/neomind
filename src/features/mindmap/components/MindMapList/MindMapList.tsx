import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  FileText,
  Calendar,
  MoreVertical,
  Sparkles,
  Clock,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { MindMap } from '@/features/mindmap/services/supabaseService';

interface MindMapListProps {
  mindMaps: MindMap[];
  currentMindMapId: string | null;
  isLoading: boolean;
  onCreateNew: () => void;
  onSelect: (mindMapId: string) => void;
  onUpdateTitle: (mindMapId: string, title: string) => void;
  onDelete: (mindMapId: string) => void;
}

export const MindMapList = ({
  mindMaps,
  currentMindMapId,
  isLoading,
  onCreateNew,
  onSelect,
  onUpdateTitle,
  onDelete,
}: MindMapListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const handleStartEdit = (mindMap: MindMap) => {
    setEditingId(mindMap.id);
    setEditTitle(mindMap.title);
    setShowMenuId(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onUpdateTitle(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (mindMapId: string) => {
    if (
      confirm('Bạn có chắc muốn xóa mind map này? Tất cả dữ liệu sẽ bị mất.')
    ) {
      onDelete(mindMapId);
    }
    setShowMenuId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hôm nay';
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200/50 mx-4 md:mx-auto'>
      {/* Header */}
      <div className='px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200/80 bg-gradient-to-r from-blue-50/90 to-indigo-50/90'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-3 sm:gap-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-60 animate-pulse'></div>
              <div className='relative p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl'>
                <Sparkles className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
              </div>
            </div>
            <div data-tour='header-title'>
              <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                Mind Maps của tôi
              </h2>
              <div className='hidden sm:flex items-center gap-3 mt-1'>
                <p className='text-sm text-gray-600 flex items-center gap-1.5'>
                  <Layers className='w-4 h-4' />
                  {mindMaps.length} mind map{mindMaps.length !== 1 ? 's' : ''}
                </p>
                <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                <p className='text-sm text-gray-600 flex items-center gap-1.5'>
                  <TrendingUp className='w-4 h-4' />
                  Đang hoạt động
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onCreateNew}
            data-tour='create-button'
            className='group flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-0.5 w-full sm:w-auto justify-center'
          >
            <Plus className='w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-90' />
            <span className='font-semibold text-sm sm:text-base'>Tạo mới</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-50/50 to-white/50'>
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='bg-white/60 backdrop-blur rounded-2xl p-6 animate-pulse shadow-lg'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-12 h-12 bg-gray-200 rounded-xl'></div>
                  <div className='w-6 h-6 bg-gray-200 rounded'></div>
                </div>
                <div className='h-6 bg-gray-200 rounded-lg w-3/4 mb-3'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
                <div className='flex gap-2'>
                  <div className='h-3 bg-gray-200 rounded w-20'></div>
                  <div className='h-3 bg-gray-200 rounded w-16'></div>
                </div>
              </div>
            ))}
          </div>
        ) : mindMaps.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='relative mb-8'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-3xl blur-2xl opacity-30 animate-pulse'></div>
              <div className='relative p-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl'>
                <FileText className='w-20 h-20 text-blue-600' />
              </div>
            </div>
            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
              Chưa có mind map nào
            </h3>
            <p className='text-gray-600 mb-8 text-center max-w-lg text-lg leading-relaxed'>
              Bắt đầu tạo mind map đầu tiên của bạn để khám phá và tổ chức ý
              tưởng một cách trực quan
            </p>
            <button
              onClick={onCreateNew}
              className='group flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1'
            >
              <Plus className='w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-90' />
              <span className='font-semibold text-base sm:text-lg'>
                Tạo mind map đầu tiên
              </span>
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {mindMaps.map((mindMap, index) => (
              <div
                key={mindMap.id}
                data-tour={index === 0 ? 'mindmap-card' : undefined}
                className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-1 ${
                  currentMindMapId === mindMap.id
                    ? 'border-blue-400 shadow-2xl shadow-blue-500/30 scale-[1.03] ring-2 ring-blue-400 ring-offset-2'
                    : 'border-gray-200/80 hover:border-blue-300 hover:shadow-xl'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.5s ease-out forwards',
                }}
                onMouseEnter={() => setHoveredId(mindMap.id)}
                onMouseLeave={() => {
                  setHoveredId(null);
                  setShowMenuId(null);
                }}
                onClick={() => {
                  if (editingId !== mindMap.id) {
                    onSelect(mindMap.id);
                  }
                }}
              >
                {/* Active indicator */}
                {currentMindMapId === mindMap.id && (
                  <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient'></div>
                )}

                {/* Card Content */}
                <div className='p-4 sm:p-5 md:p-6 relative'>
                  {editingId === mindMap.id ? (
                    <div className='space-y-3'>
                      <input
                        type='text'
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className='w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-gray-900'
                        autoFocus
                      />
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit();
                          }}
                          className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        >
                          <Check className='w-4 h-4' />
                          <span className='text-sm font-medium'>Lưu</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
                        >
                          <X className='w-4 h-4' />
                          <span className='text-sm font-medium'>Hủy</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Icon và Title */}
                      <div className='flex items-start justify-between mb-5'>
                        <div className='relative group/icon'>
                          <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur opacity-0 group-hover/icon:opacity-40 transition-opacity duration-300'></div>
                          <div className='relative p-3.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl transform transition-transform duration-300 group-hover/icon:scale-110'>
                            <FileText className='w-7 h-7 text-blue-600' />
                          </div>
                        </div>
                        <div className='relative'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenuId(
                                showMenuId === mindMap.id ? null : mindMap.id
                              );
                            }}
                            data-tour={index === 0 ? 'mindmap-menu' : undefined}
                            className='p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110'
                          >
                            <MoreVertical className='w-5 h-5' />
                          </button>

                          {/* Dropdown Menu */}
                          {showMenuId === mindMap.id && (
                            <div className='absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200/50 py-1.5 z-10 animate-fadeIn'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(mindMap);
                                }}
                                className='w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200'
                              >
                                <Edit2 className='w-4 h-4' />
                                <span>Đổi tên</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(mindMap.id);
                                }}
                                className='w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200'
                              >
                                <Trash2 className='w-4 h-4' />
                                <span>Xóa</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className={`font-bold text-lg mb-4 line-clamp-2 transition-colors duration-300 ${
                          currentMindMapId === mindMap.id
                            ? 'text-blue-700'
                            : 'text-gray-900 group-hover:text-blue-600'
                        }`}
                      >
                        {mindMap.title}
                      </h3>

                      {/* Date Info */}
                      <div className='flex items-center gap-3 text-xs'>
                        <div className='flex items-center gap-1.5 text-gray-500'>
                          <Calendar className='w-3.5 h-3.5' />
                          <span className='font-medium'>
                            {formatDate(mindMap.updated_at)}
                          </span>
                        </div>
                        <span className='text-gray-300'>•</span>
                        <div className='flex items-center gap-1.5 text-gray-500'>
                          <Clock className='w-3.5 h-3.5' />
                          <span>{getTimeAgo(mindMap.updated_at)}</span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      {hoveredId === mindMap.id &&
                        currentMindMapId !== mindMap.id && (
                          <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 pointer-events-none animate-fadeIn'></div>
                        )}

                      {/* Bottom gradient decoration */}
                      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500'></div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
