import { useState } from 'react';
import { useAuthRedux } from '../hooks/useAuthRedux';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { analytics } from '@/shared/utils/analytics';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuthRedux();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(email, password);
    // Track login event nếu thành công
    if (result.type.includes('fulfilled')) {
      analytics.trackLogin();
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-white rounded-xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Email
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                placeholder='your@email.com'
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Mật khẩu
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                placeholder='••••••••'
                disabled={loading}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
