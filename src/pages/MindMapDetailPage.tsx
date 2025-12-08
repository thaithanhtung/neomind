import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { LoadingOverlay } from '@/shared/components/LoadingOverlay';
import { EmptyState } from '@/shared/components/EmptyState';
import { TopicInput } from '@/features/topic-input/components';
import { MindMap } from '@/features/mindmap/components/MindMap';
import { MindMapProvider } from '@/features/mindmap/context';
import { useMindMapRedux } from '@/features/mindmap/hooks/useMindMapRedux';
import { useAuthRedux } from '@/features/auth/hooks/useAuthRedux';
import { AuthPage } from '@/features/auth/components';

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
    onCreateNode,
    onSelectMindMap,
  } = useMindMapRedux();

  // Sync URL với selected mind map
  useEffect(() => {
    if (id && id !== currentMindMapId) {
      onSelectMindMap(id);
    }
  }, [id, currentMindMapId, onSelectMindMap]);

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

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100'>
      <Header
        nodesCount={nodes.length}
        showInput={showInput}
        onToggleInput={() => setShowInput(!showInput)}
        onShowMindMapList={handleShowMindMapList}
      />

      {showInput && (
        <div className='px-6 py-6 bg-white border-b border-gray-200 z-10'>
          <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoading} />
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
          <div className='w-full h-full animate-fadeIn'>
            <MindMapProvider onTextSelected={handleTextSelected}>
              <MindMap
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                highlightedTexts={highlightedTexts}
              />
            </MindMapProvider>
          </div>
        )}
      </div>

      {isLoading && <LoadingOverlay />}
    </div>
  );
};

