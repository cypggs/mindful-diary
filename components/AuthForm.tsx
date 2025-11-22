'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const router = useRouter();

  const handleResendConfirmation = async () => {
    if (!email) {
      setMessage('请输入您的邮箱地址');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setMessage('✅ 确认邮件已重新发送，请检查您的邮箱');
      setShowResendEmail(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '发送失败';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('注册成功！📧 请检查您的邮箱并点击确认链接完成注册');
        setShowResendEmail(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '发生未知错误';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-10 rounded-2xl shadow-2xl animate-fade-in border border-amber-200/50 dark:border-yellow-700/30">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Mindful Diary
          </h2>
          <p className="text-amber-600 dark:text-amber-400">
            记录你的灵感与心情
          </p>
        </div>

        <form onSubmit={handleAuth} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-amber-200/50 dark:border-yellow-700/30 placeholder-amber-400 dark:placeholder-amber-500 text-amber-900 dark:text-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/50 dark:bg-amber-900/20 transition-all"
                placeholder="邮箱地址"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-amber-200/50 dark:border-yellow-700/30 placeholder-amber-400 dark:placeholder-amber-500 text-amber-900 dark:text-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/50 dark:bg-amber-900/20 transition-all"
                placeholder="密码"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('成功')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
            >
              {isSignUp ? '已有账号？立即登录' : '没有账号？立即注册'}
            </button>
          </div>

          {showResendEmail && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className="text-sm text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                没收到邮件？点击重新发送
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
