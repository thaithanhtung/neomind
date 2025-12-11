import { useState, useEffect } from 'react';
import { Settings, Lock, Check, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadUserProfile,
  updateAIModelInStore,
} from '@/store/slices/userProfileSlice';

const AVAILABLE_MODELS = [
  {
    value: 'gpt-5',
    label: 'GPT-5',
    description: 'Mạnh nhất, thông minh nhất, đắt nhất',
    cost: '$0.15 / 1K tokens',
    badge: 'Premium',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'gpt-5-mini',
    label: 'GPT-5 Mini',
    description: 'Cân bằng giữa hiệu suất và chi phí',
    cost: '$0.05 / 1K tokens',
    badge: 'Recommended',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'gpt-5-nano',
    label: 'GPT-5 Nano',
    description: 'Nhanh, rẻ, phù hợp cho tác vụ đơn giản',
    cost: '$0.01 / 1K tokens',
    badge: 'Economy',
    badgeColor: 'bg-green-100 text-green-700',
  },
];

export const ModelSelector = () => {
  const dispatch = useAppDispatch();

  // ✨ Sử dụng Redux store thay vì local state
  const { profile, isLoading: isLoadingProfile } = useAppSelector(
    (state) => state.userProfile
  );

  const [selectedModel, setSelectedModel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ✨ Load profile từ Redux (có caching)
  useEffect(() => {
    dispatch(loadUserProfile({ force: false }));
  }, [dispatch]);

  // Sync selectedModel với profile từ Redux
  useEffect(() => {
    if (profile?.ai_model) {
      setSelectedModel(profile.ai_model);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // ✨ Sử dụng Redux action
      await dispatch(updateAIModelInStore(selectedModel)).unwrap();

      setMessage({
        type: 'success',
        text: 'Đã cập nhật AI model thành công!',
      });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Không thể cập nhật model',
      });
    }

    setIsSaving(false);

    // Auto hide message sau 3 giây
    setTimeout(() => setMessage(null), 3000);
  };

  // Chỉ super_admin mới thấy component này
  if (isLoadingProfile) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!profile || profile.role !== 'super_admin') {
    return null;
  }

  const hasChanges = selectedModel !== profile.ai_model;

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-4'>
        <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
          <Settings className='w-5 h-5 text-blue-600 dark:text-blue-400' />
        </div>
        <div className='flex-1'>
          <h3 className='font-semibold text-gray-900 dark:text-white'>
            AI Model Configuration
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Model này sẽ được sử dụng cho tất cả mind maps của bạn
          </p>
        </div>
        <span className='text-xs px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full font-medium flex items-center gap-1'>
          <Lock className='w-3 h-3' />
          Super Admin
        </span>
      </div>

      {/* Model Options */}
      <div className='space-y-3 mb-4'>
        {AVAILABLE_MODELS.map((model) => (
          <label
            key={model.value}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedModel === model.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type='radio'
              name='ai-model'
              value={model.value}
              checked={selectedModel === model.value}
              onChange={(e) => setSelectedModel(e.target.value)}
              className='mt-1 w-4 h-4 text-blue-600'
            />
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {model.label}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${model.badgeColor}`}
                >
                  {model.badge}
                </span>
                {selectedModel === model.value && (
                  <Check className='w-4 h-4 text-blue-600' />
                )}
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                {model.description}
              </p>
              <p className='text-xs font-mono text-gray-500 dark:text-gray-500'>
                💰 Chi phí: <span className='font-semibold'>{model.cost}</span>
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <Check className='w-4 h-4' />
          ) : (
            <AlertCircle className='w-4 h-4' />
          )}
          <span className='text-sm font-medium'>{message.text}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        className='w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2'
      >
        {isSaving ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
            <span>Đang lưu...</span>
          </>
        ) : (
          <span>{hasChanges ? 'Cập nhật Model' : 'Đã lưu'}</span>
        )}
      </button>

      {/* Info */}
      <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg'>
        <p className='text-xs text-gray-600 dark:text-gray-400'>
          💡 <strong>Lưu ý:</strong> Chỉ Super Admin mới có thể thay đổi AI
          model. Model được chọn sẽ ảnh hưởng đến chất lượng và chi phí của việc
          tạo nội dung.
        </p>
      </div>
    </div>
  );
};
