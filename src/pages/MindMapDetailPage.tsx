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

export const MindMapDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthRedux();
  const [showInput, setShowInput] = useState(false);
  const {
    nodes,
    edges,
    isLoading,
    isLoadingData,
    highlightedTexts,
    mindMaps,
    currentMindMapId,
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
  } = useMindMapRedux();
  const { startTour } = useTour('mindmap-detail');
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lấy selected node để xóa
  const selectedNode = nodes.find((n) => n.selected);

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

      {/* Tags Input */}
      {currentMindMapId && (
        <div className='px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10'>
          <TagInput mindMapId={currentMindMapId} />
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
