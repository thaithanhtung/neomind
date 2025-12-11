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
import { analytics } from '@/shared/utils/analytics';
import { useTour } from '@/shared/hooks/useTour';
import {
  mindMapDetailTourSteps,
  mindMapDetailWithNodesTourSteps,
} from '@/shared/utils/tourSteps';
import { TagInput } from '@/shared/components/TagInput';
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';
import { ReactFlowInstance } from 'reactflow';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  } = useMindMapRedux();
  const { startTour } = useTour('mindmap-detail');
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [localSystemPrompt, setLocalSystemPrompt] = useState('');

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
      />

      {showInput && (
        <div
          className='px-6 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10'
          data-tour='topic-input'
        >
          <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoading} />
        </div>
      )}

      {/* Tags Input - Collapsible */}
      {currentMindMapId && (
        <div
          className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10'
          data-tour='tags-section'
        >
          <button
            onClick={() => {
              const newValue = !showTags;
              setShowTags(newValue);
              localStorage.setItem('mindmap-show-tags', String(newValue));
            }}
            className='w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
          >
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                Tags
              </span>
            </div>
            {showTags ? (
              <ChevronUp className='w-4 h-4 text-gray-500 dark:text-gray-400' />
            ) : (
              <ChevronDown className='w-4 h-4 text-gray-500 dark:text-gray-400' />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showTags ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className='px-6 pb-4'>
              <TagInput mindMapId={currentMindMapId} />
            </div>
          </div>
        </div>
      )}

      {/* System Prompt config - Collapsible */}
      {currentMindMapId && (
        <div
          className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10'
          data-tour='system-prompt-section'
        >
          <button
            onClick={() => {
              const newValue = !showSystemPrompt;
              setShowSystemPrompt(newValue);
              localStorage.setItem(
                'mindmap-show-system-prompt',
                String(newValue)
              );
            }}
            className='w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
          >
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                System Prompt
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                (từng mind map)
              </span>
            </div>
            {showSystemPrompt ? (
              <ChevronUp className='w-4 h-4 text-gray-500 dark:text-gray-400' />
            ) : (
              <ChevronDown className='w-4 h-4 text-gray-500 dark:text-gray-400' />
            )}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showSystemPrompt ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className='px-6 pb-4'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <textarea
                    value={localSystemPrompt}
                    onChange={(e) => setLocalSystemPrompt(e.target.value)}
                    onBlur={() => onUpdateSystemPrompt(localSystemPrompt)}
                    onMouseDown={(e) => {
                      // Tránh các handler bên ngoài cản focus
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const target = e.currentTarget;
                      // Đảm bảo focus khi click
                      requestAnimationFrame(() => target.focus());
                    }}
                    placeholder='Nhập system prompt cho AI khi tạo nội dung cho mind map này'
                    className='w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none text-sm resize-none transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500'
                    rows={3}
                  />
                </div>
                <button
                  onClick={() => onUpdateSystemPrompt(localSystemPrompt)}
                  className='self-start mt-7 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold'
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
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
            className='w-full h-full animate-fadeIn'
            data-tour='mindmap-canvas'
          >
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
    </div>
  );
};
