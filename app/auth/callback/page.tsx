'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在验证您的邮箱...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setStatus('error');
            setMessage('确认链接已过期，请重新注册或登录后请求新的确认邮件');
          } else {
            setStatus('error');
            setMessage(`验证失败: ${errorDescription || error}`);
          }
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setStatus('error');
          setMessage('验证失败，请重试');
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('邮箱验证成功！正在跳转...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('success');
          setMessage('邮箱验证成功！请登录您的账号');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('验证过程中出现错误');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-diary-100 via-orange-50 to-amber-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-diary-200/40 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-diary-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* 状态卡片 */}
      <div className="relative z-10 w-full max-w-sm animate-scale-in">
        <div className="bg-white rounded-3xl shadow-xl border border-diary-200 p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="text-xl font-semibold text-diary-900 mb-2">验证中...</h2>
              <p className="text-diary-600 text-sm">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-xl font-semibold text-green-600 mb-2">验证成功！</h2>
              <p className="text-diary-600 text-sm">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-6">😢</div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">验证失败</h2>
              <p className="text-diary-600 text-sm mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="
                    w-full py-3
                    bg-gradient-to-r from-diary-500 to-orange-500
                    hover:from-diary-600 hover:to-orange-600
                    text-white font-semibold
                    rounded-xl
                    shadow-lg shadow-diary-300/50 hover:shadow-xl
                    transition-all duration-300
                    hover:-translate-y-0.5 active:translate-y-0
                  "
                >
                  返回登录
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="
                    w-full py-3
                    bg-diary-100 hover:bg-diary-200
                    text-diary-700 font-medium
                    rounded-xl
                    transition-all duration-300
                  "
                >
                  重试
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
