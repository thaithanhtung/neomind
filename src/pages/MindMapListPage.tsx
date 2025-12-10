import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { LoadingOverlay } from '@/shared/components/LoadingOverlay';
import { MindMapList } from '@/features/mindmap/components/MindMapList';
import { useMindMapRedux } from '@/features/mindmap/hooks/useMindMapRedux';
import { useAuthRedux } from '@/features/auth/hooks/useAuthRedux';
import { AuthPage, EmailConfirmationPage } from '@/features/auth/components';
import { analytics } from '@/shared/utils/analytics';

export const MindMapListPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthRedux();
  const {
    mindMaps,
    isLoadingMindMaps,
    currentMindMapId,
    onCreateNewMindMap,
    onSelectMindMap,
    onUpdateMindMapTitle,
    onDeleteMindMap,
  } = useMindMapRedux();

  // Track mind map list view
  useEffect(() => {
    analytics.trackMindMapListView();
  }, []);

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

  const handleCreateNew = async () => {
    const title = prompt('Nhập tên cho mind map mới:', 'Untitled Mind Map');
    if (title && title.trim()) {
      const newMindMapId = await onCreateNewMindMap(title.trim());
      if (newMindMapId) {
        navigate(`/mindmaps/${newMindMapId}`);
      }
    }
  };

  const handleSelect = (mindMapId: string) => {
    onSelectMindMap(mindMapId);
    navigate(`/mindmaps/${mindMapId}`);
  };

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100'>
      <Header nodesCount={0} showInput={false} onToggleInput={() => {}} />

      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-7xl mx-auto'>
          <MindMapList
            mindMaps={mindMaps}
            currentMindMapId={currentMindMapId}
            isLoading={isLoadingMindMaps}
            onCreateNew={handleCreateNew}
            onSelect={handleSelect}
            onUpdateTitle={onUpdateMindMapTitle}
            onDelete={onDeleteMindMap}
          />
        </div>
      </div>

      {isLoadingMindMaps && <LoadingOverlay />}
    </div>
  );
};
