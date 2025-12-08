import { Brain } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div className='text-center'>
        <Brain className='w-24 h-24 text-gray-300 mx-auto mb-4' />
        <h2 className='text-2xl font-semibold text-gray-700 mb-2'>
          Bắt đầu với NeoMind
        </h2>
        <p className='text-gray-500 mb-6'>
          Nhập chủ đề hoặc câu hỏi để tạo sơ đồ tư duy đầu tiên
        </p>
      </div>
    </div>
  );
};

