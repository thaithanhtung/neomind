import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { LoadingOverlay } from '@/shared/components/LoadingOverlay';
import { useAuthRedux } from '@/features/auth/hooks/useAuthRedux';
import { AuthPage, EmailConfirmationPage } from '@/features/auth/components';
import { useUserSettings } from '@/shared/hooks/useUserSettings';
import {
  User,
  Volume2,
  VolumeX,
  Settings,
  ArrowLeft,
  Save,
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';
import { UIConfigPanel } from '@/shared/components/UIColorPicker';
import { UIConfig } from '@/shared/hooks/useUserSettings';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthRedux();
  const { settings, isLoaded, updateSetting, resetSettings } =
    useUserSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings với settings từ hook
  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  }, [settings, isLoaded]);

  // Track profile view
  useEffect(() => {
    if (user && isLoaded) {
      // Track profile view
    }
  }, [user, isLoaded]);

  // Hiển thị loading khi đang check auth
  if (authLoading || !isLoaded) {
    return <LoadingOverlay />;
  }

  // Hiển thị trang đăng nhập nếu chưa đăng nhập
  if (!user) {
    return <AuthPage />;
  }

  // Kiểm tra email đã được confirm chưa
  if (user && !user.email_confirmed_at && user.email) {
    return <EmailConfirmationPage email={user.email} />;
  }

  const handleSettingChange = (
    key: keyof typeof localSettings,
    value: boolean | UIConfig
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleUIConfigChange = (config: UIConfig) => {
    setLocalSettings((prev) => ({ ...prev, uiConfig: config }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSetting('enableTextToSpeech', localSettings.enableTextToSpeech);
    updateSetting('darkMode', localSettings.darkMode);
    updateSetting('uiConfig', localSettings.uiConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn reset về cài đặt mặc định?')) {
      resetSettings();
      setHasChanges(false);
    }
  };

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <Header nodesCount={0} showInput={false} onToggleInput={() => {}} />

      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <button
              onClick={() => navigate('/')}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-4 transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Quay lại</span>
            </button>
            <div className='flex items-center gap-4'>
              <div className='p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg'>
                <User className='w-8 h-8 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                  Hồ sơ
                </h1>
                <p className='text-gray-600 dark:text-gray-300 mt-1'>
                  Quản lý thông tin và cài đặt của bạn
                </p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
              <User className='w-5 h-5' />
              Thông tin tài khoản
            </h2>
            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Email
                </label>
                <p className='text-gray-900 dark:text-white mt-1'>
                  {user.email}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Trạng thái
                </label>
                <p className='text-gray-900 dark:text-white mt-1'>
                  {user.email_confirmed_at
                    ? 'Đã xác thực email'
                    : 'Chưa xác thực email'}
                </p>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
                <Settings className='w-5 h-5' />
                Cài đặt
              </h2>
              {hasChanges && (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleReset}
                    className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <RotateCcw className='w-4 h-4' />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <Save className='w-4 h-4' />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              )}
            </div>

            <div className='space-y-6'>
              {/* Dark Mode Setting */}
              <div className='flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    {localSettings.darkMode ? (
                      <Moon className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />
                    ) : (
                      <Sun className='w-5 h-5 text-yellow-500' />
                    )}
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                      Chế độ tối
                    </h3>
                  </div>
                  <p className='text-gray-600 dark:text-gray-300 text-sm ml-8'>
                    Bật/tắt chế độ tối để bảo vệ mắt khi làm việc trong môi
                    trường thiếu sáng.
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer ml-4'>
                  <input
                    type='checkbox'
                    checked={localSettings.darkMode}
                    onChange={(e) =>
                      handleSettingChange('darkMode', e.target.checked)
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Text to Speech Setting */}
              <div className='flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    {localSettings.enableTextToSpeech ? (
                      <Volume2 className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                    ) : (
                      <VolumeX className='w-5 h-5 text-gray-400' />
                    )}
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                      Đọc nội dung node
                    </h3>
                  </div>
                  <p className='text-gray-600 dark:text-gray-300 text-sm ml-8'>
                    Bật/tắt tính năng đọc nội dung node bằng giọng nói. Khi bật,
                    bạn có thể nhấn vào nút loa trên mỗi node để nghe nội dung
                    được đọc.
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer ml-4'>
                  <input
                    type='checkbox'
                    checked={localSettings.enableTextToSpeech}
                    onChange={(e) =>
                      handleSettingChange(
                        'enableTextToSpeech',
                        e.target.checked
                      )
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* UI Config Setting */}
              <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600'>
                <UIConfigPanel
                  config={localSettings.uiConfig}
                  onChange={handleUIConfigChange}
                />
              </div>
            </div>

            {!hasChanges && (
              <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl'>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  Tất cả thay đổi đã được lưu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
