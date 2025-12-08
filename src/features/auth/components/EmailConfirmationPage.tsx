import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAuthRedux } from '../hooks/useAuthRedux';
import { supabase } from '@/features/mindmap/services/supabaseService';

interface EmailConfirmationPageProps {
  email: string;
}

export const EmailConfirmationPage = ({ email }: EmailConfirmationPageProps) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const { signOut } = useAuthRedux();

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setResendError(error.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (error) {
      setResendError('Có lỗi xảy ra khi gửi lại email. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <div className='text-center'>
            {/* Icon */}
            <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Mail className='w-10 h-10 text-yellow-600' />
            </div>

            {/* Title */}
            <h2 className='text-2xl font-bold text-gray-800 mb-3'>
              Xác nhận email của bạn
            </h2>

            {/* Message */}
            <p className='text-gray-600 mb-4'>
              Chúng tôi đã gửi email xác nhận đến:
            </p>
            <p className='text-lg font-semibold text-blue-600 mb-6 break-all'>
              {email}
            </p>

            {/* Instructions */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                <div className='text-sm text-gray-700'>
                  <p className='font-medium text-gray-800 mb-2'>Vui lòng làm theo các bước sau:</p>
                  <ol className='list-decimal list-inside space-y-1 text-gray-600'>
                    <li>Kiểm tra hộp thư đến của bạn</li>
                    <li>Mở email từ NeoMind</li>
                    <li>Click vào link "Xác nhận email" trong email</li>
                    <li>Quay lại đăng nhập sau khi xác nhận</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Resend Email Section */}
            <div className='mb-6'>
              {resendSuccess && (
                <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  <span>Email đã được gửi lại thành công!</span>
                </div>
              )}

              {resendError && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4'>
                  {resendError}
                </div>
              )}

              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isResending ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className='w-5 h-5' />
                    <span>Gửi lại email xác nhận</span>
                  </>
                )}
              </button>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
            >
              Đăng xuất và quay lại trang đăng nhập
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className='mt-6 text-center'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>NeoMind</h1>
          <p className='text-gray-600 text-sm'>
            Sơ đồ tư duy thông minh với AI
          </p>
        </div>
      </div>
    </div>
  );
};

