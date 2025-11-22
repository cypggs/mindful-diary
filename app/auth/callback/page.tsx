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
        // 从 URL hash 中获取认证信息
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          // 检查是否是已过期的错误
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setStatus('error');
            setMessage('确认链接已过期，请重新注册或登录后请求新的确认邮件');
          } else {
            setStatus('error');
            setMessage(`验证失败: ${errorDescription || error}`);
          }
          return;
        }

        // 检查用户会话
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950 px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl shadow-2xl p-8 text-center animate-fade-in border border-amber-200/50 dark:border-yellow-700/30">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
              验证中
            </h2>
            <p className="text-amber-600 dark:text-amber-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="text-6xl">✅</div>
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              验证成功
            </h2>
            <p className="text-amber-600 dark:text-amber-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="text-6xl">❌</div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              验证失败
            </h2>
            <p className="text-amber-600 dark:text-amber-400 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all font-medium shadow-md"
              >
                返回登录
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-amber-100 dark:bg-amber-800/30 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700/40 transition-all font-medium"
              >
                重试
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
