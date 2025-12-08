import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Toggle between Login and Signup */}
        <div className='flex bg-white rounded-t-xl shadow-lg p-1 mb-0'>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              isLogin
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              !isLogin
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <div className='bg-white rounded-b-xl shadow-lg overflow-hidden'>
          {isLogin ? <LoginForm /> : <SignupForm />}
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

