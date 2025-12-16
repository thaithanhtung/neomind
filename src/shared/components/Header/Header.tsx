import {
  Brain,
  LogOut,
  User,
  FolderOpen,
  Home,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/features/auth/hooks/useAuthRedux';
import { analytics } from '@/shared/utils/analytics';

interface HeaderProps {
  nodesCount?: number;
  showInput?: boolean;
  onToggleInput?: () => void;
  onShowMindMapList?: () => void;
  onStartTour?: () => void;
  exportMenu?: React.ReactNode;
  searchBar?: React.ReactNode;
  undoRedo?: React.ReactNode;
  shareButton?: React.ReactNode;
}

export const Header = (props: HeaderProps) => {
  const {
    onShowMindMapList,
    onStartTour,
    exportMenu,
    searchBar,
    undoRedo,
    shareButton,
  } = props;
  const navigate = useNavigate();
  const { user, signOut } = useAuthRedux();

  const handleSignOut = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await signOut();
      analytics.trackLogout();
    }
  };

  return (
    <header
      className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6 md:py-4 z-10'
      data-tour='header'
    >
      <div className='flex items-center justify-between max-w-7xl mx-auto gap-3 md:gap-6 flex-wrap'>
        <button
          onClick={() => {
            navigate('/');
            analytics.trackMindMapListView();
          }}
          className='flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity cursor-pointer'
          data-tour='header-title'
          title='Về trang chủ'
        >
          <div className='p-2 bg-blue-600 rounded-lg'>
            <Brain className='w-5 h-5 md:w-6 md:h-6 text-white' />
          </div>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>
              NeoMind
            </h1>
            <p className='hidden sm:block text-xs md:text-sm text-gray-500 dark:text-gray-400'>
              Sơ đồ tư duy thông minh
            </p>
          </div>
        </button>

        <div className='flex items-center gap-2 md:gap-4 flex-wrap justify-end flex-1 min-w-0'>
          {searchBar && (
            <div className='hidden md:block w-40 lg:w-64'>{searchBar}</div>
          )}
          {undoRedo}
          {exportMenu}
          {shareButton}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors'
              title='Hướng dẫn sử dụng'
            >
              <HelpCircle className='w-4 h-4' />
              <span className='hidden sm:inline text-xs md:text-sm'>
                Hướng dẫn
              </span>
            </button>
          )}
          {onShowMindMapList ? (
            <button
              onClick={() => {
                onShowMindMapList();
                analytics.trackMindMapListView();
              }}
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              title='Quản lý Mind Maps'
              data-tour='back-button'
            >
              <FolderOpen className='w-4 h-4' />
              <span className='hidden sm:inline text-xs md:text-sm'>
                Mind Maps
              </span>
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
              <span className='hidden sm:inline text-xs md:text-sm'>
                Trang chủ
              </span>
            </button>
          )}

          {user && (
            <div className='flex items-center gap-2 md:gap-3'>
              <button
                onClick={() => navigate('/profile')}
                className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                title='Hồ sơ'
              >
                <Settings className='w-4 h-4' />
                <span className='hidden sm:inline text-xs md:text-sm'>
                  Cài đặt
                </span>
              </button>
              <div className='hidden md:flex items-center gap-2 text-xs md:text-sm text-gray-600 max-w-[150px]'>
                <User className='w-4 h-4' />
                <span className='truncate'>{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className='flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                title='Đăng xuất'
              >
                <LogOut className='w-4 h-4' />
                <span className='hidden sm:inline text-xs md:text-sm'>
                  Đăng xuất
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
