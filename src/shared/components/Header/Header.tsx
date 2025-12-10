import { Brain, LogOut, User, FolderOpen, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/features/auth/hooks/useAuthRedux';
import { analytics } from '@/shared/utils/analytics';

interface HeaderProps {
  nodesCount?: number;
  showInput?: boolean;
  onToggleInput?: () => void;
  onShowMindMapList?: () => void;
}

export const Header = (props: HeaderProps) => {
  const { onShowMindMapList } = props;
  const navigate = useNavigate();
  const { user, signOut } = useAuthRedux();

  const handleSignOut = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await signOut();
      analytics.trackLogout();
    }
  };

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-10'>
      <div className='flex items-center justify-between max-w-7xl mx-auto'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-600 rounded-lg'>
            <Brain className='w-6 h-6 text-white' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>NeoMind</h1>
            <p className='text-sm text-gray-500'>Sơ đồ tư duy thông minh</p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {onShowMindMapList ? (
            <button
              onClick={() => {
                onShowMindMapList();
                analytics.trackMindMapListView();
              }}
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              title='Quản lý Mind Maps'
            >
              <FolderOpen className='w-4 h-4' />
              <span className='hidden sm:inline'>Mind Maps</span>
            </button>
          ) : (
            <button
              onClick={() => {
                navigate('/');
                analytics.trackMindMapListView();
              }}
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              title='Về trang chủ'
            >
              <Home className='w-4 h-4' />
              <span className='hidden sm:inline'>Trang chủ</span>
            </button>
          )}

          {user && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <User className='w-4 h-4' />
                <span className='max-w-[150px] truncate'>{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                title='Đăng xuất'
              >
                <LogOut className='w-4 h-4' />
                <span className='hidden sm:inline'>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
