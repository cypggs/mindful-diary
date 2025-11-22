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
    <div className="min-h-screen bg-gradient-to-b from-diary-50 via-diary-100/50 to-diary-200/30 flex items-center justify-center relative overflow-hidden px-4">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-diary-300/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-diary-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 right-1/3 w-60 h-60 bg-diary-300/15 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="bg-white/70 backdrop-blur-xl rounded-4xl shadow-soft-lg border border-diary-100 p-8 sm:p-10">
          {/* Logo & 标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-diary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-diary-900 mb-1">
              Mindful Diary
            </h1>
            <p className="text-diary-500 text-sm">
              记录你的灵感与心情
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱地址"
                className="
                  w-full px-4 py-3.5
                  bg-diary-50/50
                  border border-diary-200/50
                  rounded-xl
                  text-diary-900
                  placeholder:text-diary-300
                  focus:outline-none focus:ring-2 focus:ring-diary-300/50 focus:border-transparent focus:bg-white
                  transition-all duration-300
                "
              />
            </div>

            {/* 密码输入 */}
            <div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="
                  w-full px-4 py-3.5
                  bg-diary-50/50
                  border border-diary-200/50
                  rounded-xl
                  text-diary-900
                  placeholder:text-diary-300
                  focus:outline-none focus:ring-2 focus:ring-diary-300/50 focus:border-transparent focus:bg-white
                  transition-all duration-300
                "
              />
            </div>

            {/* 消息提示 */}
            {message && (
              <div className={`
                p-4 rounded-xl text-sm animate-fade-in
                ${message.includes('成功')
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
                }
              `}>
                {message}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5
                bg-diary-500 hover:bg-diary-600
                text-white font-semibold
                rounded-xl
                shadow-md hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                hover:-translate-y-0.5 active:translate-y-0
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  处理中...
                </span>
              ) : (isSignUp ? '注册' : '登录')}
            </button>

            {/* 切换登录/注册 */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage('');
                  setShowResendEmail(false);
                }}
                className="text-sm text-diary-500 hover:text-diary-700 transition-colors"
              >
                {isSignUp ? '已有账号？立即登录' : '没有账号？立即注册'}
              </button>
            </div>

            {/* 重发邮件 */}
            {showResendEmail && (
              <div className="text-center animate-fade-in">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-sm text-diary-400 hover:text-diary-600 transition-colors disabled:opacity-50"
                >
                  没收到邮件？点击重新发送
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 底部装饰文字 */}
        <p className="text-center text-xs text-diary-400 mt-6">
          每一天都值得被记住
        </p>
      </div>
    </div>
  );
}
