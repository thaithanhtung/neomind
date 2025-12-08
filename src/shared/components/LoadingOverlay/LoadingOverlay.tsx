import { Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message = 'Đang tạo nội dung...' }: LoadingOverlayProps) => {
  return (
    <div className='absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn'>
      <div className='bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5 transform animate-fadeIn'>
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-60 animate-pulse'></div>
          <div className='relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center animate-spin'>
            <Sparkles className='w-8 h-8 text-white' />
          </div>
        </div>
        <div className='text-center'>
          <p className='text-lg font-semibold text-gray-800'>{message}</p>
          <p className='text-sm text-gray-500 mt-1'>Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    </div>
  );
};

