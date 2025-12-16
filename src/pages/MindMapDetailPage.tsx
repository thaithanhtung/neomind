import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { LoadingOverlay } from '@/shared/components/LoadingOverlay';
import { EmptyState } from '@/shared/components/EmptyState';
import { TopicInput } from '@/features/topic-input/components';
import { MindMap } from '@/features/mindmap/components/MindMap';
import { MindMapProvider } from '@/features/mindmap/context';
import { useMindMapRedux } from '@/features/mindmap/hooks/useMindMapRedux';
import { useAuthRedux } from '@/features/auth/hooks/useAuthRedux';
import { AuthPage, EmailConfirmationPage } from '@/features/auth/components';
import { ShareButton } from '@/features/mindmap/components/ShareButton';
import { ModelSelector } from '@/features/user/components';
import { analytics } from '@/shared/utils/analytics';
import { useTour } from '@/shared/hooks/useTour';
import {
  mindMapDetailTourSteps,
  mindMapDetailWithNodesTourSteps,
} from '@/shared/utils/tourSteps';
import { TagInput } from '@/shared/components/TagInput';
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';
import { ReactFlowInstance } from 'reactflow';
import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';

export const MindMapDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthRedux();
  const [showInput, setShowInput] = useState(false);
  const [showTags, setShowTags] = useState(() => {
    const saved = localStorage.getItem('mindmap-show-tags');
    return saved ? saved === 'true' : false;
  });
  const [showSystemPrompt, setShowSystemPrompt] = useState(() => {
    const saved = localStorage.getItem('mindmap-show-system-prompt');
    return saved ? saved === 'true' : false;
  });
  const [showModelConfig, setShowModelConfig] = useState(() => {
    const saved = localStorage.getItem('mindmap-show-model-config');
    return saved ? saved === 'true' : false;
  });
  const {
    nodes,
    edges,
    isLoading,
    isLoadingData,
    highlightedTexts,
    mindMaps,
    currentMindMapId,
    systemPrompt,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    handleTextSelected,
    handleDeleteNode,
    onCreateNode,
    onSelectMindMap,
    undo,
    redo,
    onUpdateSystemPrompt,
    onPaneDoubleClick,
    onAutoArrange,
  } = useMindMapRedux();
  const { startTour } = useTour('mindmap-detail');
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [localSystemPrompt, setLocalSystemPrompt] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSystemPromptSaved, setShowSystemPromptSaved] = useState(false);

  // Lấy selected node để xóa
  const selectedNode = nodes.find((n) => n.selected);

  // Đồng bộ systemPrompt từ store
  useEffect(() => {
    setLocalSystemPrompt(systemPrompt || '');
  }, [systemPrompt]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: () => {
      if (selectedNode) {
        handleDeleteNode(selectedNode.id);
      }
    },
    onSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    onNewNode: () => {
      if (!showInput) {
        setShowInput(true);
      }
      // Focus vào input sau khi hiển thị
      setTimeout(() => {
        const topicInput = document.querySelector(
          '[data-tour="topic-input-field"]'
        ) as HTMLInputElement;
        if (topicInput) {
          topicInput.focus();
        }
      }, 100);
    },
  });

  // Sync URL với selected mind map
  useEffect(() => {
    if (id && id !== currentMindMapId) {
      onSelectMindMap(id);
    }
  }, [id, currentMindMapId, onSelectMindMap]);

  // Track mind map view khi load trang
  useEffect(() => {
    if (id && !isLoadingData) {
      analytics.trackMindMapView(id);
    }
  }, [id, isLoadingData]);

  // Sync URL khi currentMindMapId thay đổi (ví dụ: sau khi xóa mind map cuối cùng và tạo mới)
  useEffect(() => {
    if (currentMindMapId && currentMindMapId !== id && !isLoadingData) {
      navigate(`/mindmaps/${currentMindMapId}`, { replace: true });
    }
  }, [currentMindMapId, id, isLoadingData, navigate]);

  // Auto-hide input when mind map has nodes
  useEffect(() => {
    if (nodes.length > 0) {
      setShowInput(false);
    } else {
      setShowInput(true);
    }
  }, [nodes.length]);

  // Redirect nếu không có mind map được chọn
  useEffect(() => {
    if (!isLoadingData && !currentMindMapId && mindMaps.length > 0) {
      navigate('/');
    } else if (!isLoadingData && !currentMindMapId && mindMaps.length === 0) {
      // Nếu không có mind map nào, redirect về trang list
      navigate('/', { replace: true });
    }
  }, [currentMindMapId, mindMaps.length, isLoadingData, navigate]);

  // Hiển thị loading khi đang check auth
  if (authLoading) {
    return <LoadingOverlay />;
  }

  // Hiển thị trang đăng nhập nếu chưa đăng nhập
  if (!user) {
    return <AuthPage />;
  }

  // Kiểm tra email đã được confirm chưa
  // Nếu chưa confirm thì hiển thị trang thông báo
  if (user && !user.email_confirmed_at && user.email) {
    return <EmailConfirmationPage email={user.email} />;
  }

  const handleTopicSubmit = async (topic: string) => {
    // Kiểm tra có mind map ID chưa
    if (!currentMindMapId) {
      alert('Vui lòng chọn một mind map trước khi tạo node mới');
      return;
    }

    try {
      // Sử dụng onCreateNode từ hook để đảm bảo consistency
      await onCreateNode(topic);
      // Input will auto-hide when node is created due to useEffect
    } catch (error) {
      console.error('Error creating node:', error);
      alert('Có lỗi xảy ra khi tạo node mới. Vui lòng thử lại.');
    }
  };

  const handleShowMindMapList = () => {
    navigate('/');
  };

  const handleStartTour = () => {
    // Chọn tour steps dựa trên trạng thái hiện tại
    // Nếu đã có nodes, không cần hướng dẫn về topic-input
    const steps =
      nodes.length > 0
        ? mindMapDetailWithNodesTourSteps
        : mindMapDetailTourSteps;

    startTour({
      steps,
    });
  };

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <Header
        nodesCount={nodes.length}
        showInput={showInput}
        onToggleInput={() => {
          setShowInput(!showInput);
          analytics.trackInputToggle(!showInput);
        }}
        onShowMindMapList={handleShowMindMapList}
        onStartTour={handleStartTour}
        shareButton={
          currentMindMapId ? (
            <ShareButton mindMapId={currentMindMapId} />
          ) : undefined
        }
      />

      {showInput && (
        <div
          className='px-6 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10'
          data-tour='topic-input'
        >
          <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoading} />
        </div>
      )}

      {/* Thanh cấu hình mở modal */}
      {currentMindMapId && (
        <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 px-6 py-3 flex items-center justify-end'>
          <button
            onClick={() => setShowConfigModal(true)}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
          >
            <Settings2 className='w-4 h-4' />
            Cấu hình mind map
          </button>
        </div>
      )}

      <div className='flex-1 relative overflow-hidden'>
        {isLoadingData ? (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='flex flex-col items-center gap-4'>
              <div className='relative'>
                <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
                <div className='absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-600 rounded-full animate-spin animate-reverse-spin'></div>
              </div>
              <p className='text-gray-600 font-medium'>Đang tải mind map...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className='animate-fadeIn'>
            <EmptyState />
          </div>
        ) : (
          <div
            className='w-full h-full animate-fadeIn relative'
            data-tour='mindmap-canvas'
          >
            {/* Nút Auto arrange đơn giản (tree dọc) */}
            <div className='absolute top-4 right-4 z-20'>
              <button
                onClick={onAutoArrange}
                className='px-3 py-1.5 text-xs md:text-sm rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all text-gray-700'
                title='Tự động sắp xếp các node cho gọn gàng'
              >
                Auto arrange
              </button>
            </div>

            <MindMapProvider
              onTextSelected={handleTextSelected}
              highlightedTexts={highlightedTexts}
              onDeleteNode={handleDeleteNode}
            >
              <MindMap
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onPaneDoubleClick={(e) =>
                  onPaneDoubleClick(e, reactFlowInstanceRef.current)
                }
                onReactFlowInstanceReady={(instance) => {
                  reactFlowInstanceRef.current = instance;
                }}
              />
            </MindMapProvider>
          </div>
        )}
      </div>

      {/* Modal cấu hình: Tags, AI Model, System Prompt */}
      {showConfigModal && (
        <div
          className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn'
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'>
                  <Settings2 className='w-4 h-4' />
                </div>
                <div>
                  <h2 className='text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50'>
                    Cấu hình mind map
                  </h2>
                  <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400'>
                    Tags, AI model và system prompt cho mind map hiện tại
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className='px-3 py-1.5 text-xs md:text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              >
                Đóng
              </button>
            </div>

            {/* Body */}
            <div className='px-6 py-4 space-y-6 overflow-y-auto'>
              {/* Tags */}
              {currentMindMapId && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2'>
                    Tags
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mb-3'>
                    Gắn thẻ cho mind map để tìm kiếm và phân loại nhanh hơn.
                  </p>
                  <div className='bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3'>
                    <TagInput mindMapId={currentMindMapId} />
                  </div>
                </div>
              )}

              {/* AI Model */}
              <div>
                <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2'>
                  AI Model{' '}
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    (Super Admin)
                  </span>
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400 mb-3'>
                  Chọn model AI mặc định dùng để sinh nội dung cho các node.
                </p>
                <div className='bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3'>
                  <ModelSelector />
                </div>
              </div>

              {/* System Prompt */}
              {currentMindMapId && (
                <div>
                  <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2'>
                    System Prompt{' '}
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      (riêng cho mind map này)
                    </span>
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mb-3'>
                    Tuỳ chỉnh system prompt để điều khiển cách AI sinh nội dung
                    cho sơ đồ này.
                  </p>
                  <div className='bg-gray-50 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3'>
                    <div className='flex flex-col gap-3'>
                      <textarea
                        value={localSystemPrompt}
                        onChange={(e) => setLocalSystemPrompt(e.target.value)}
                        onBlur={() => {
                          onUpdateSystemPrompt(localSystemPrompt);
                          setShowSystemPromptSaved(true);
                          setTimeout(() => setShowSystemPromptSaved(false), 2000);
                        }}
                        placeholder='Nhập system prompt cho AI khi tạo nội dung cho mind map này'
                        className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none text-sm resize-none transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[96px]'
                        rows={3}
                      />
                      <div className='flex justify-end'>
                        <button
                          onClick={() => {
                            onUpdateSystemPrompt(localSystemPrompt);
                            setShowSystemPromptSaved(true);
                            setTimeout(
                              () => setShowSystemPromptSaved(false),
                              2000
                            );
                          }}
                          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-semibold'
                        >
                          Lưu system prompt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo lưu system prompt thành công */}
      {showSystemPromptSaved && (
        <div className='fixed bottom-4 right-4 z-50'>
          <div className='px-4 py-3 bg-green-500 text-white text-sm rounded-lg shadow-lg'>
            Đã lưu system prompt thành công.
          </div>
        </div>
      )}
    </div>
  );
};
