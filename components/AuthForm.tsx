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
    <div className="min-h-screen bg-gradient-to-br from-diary-100 via-orange-50 to-amber-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-diary-200/40 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-diary-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-300/25 rounded-full blur-2xl"></div>
      </div>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-3xl shadow-xl border border-diary-200 p-8 sm:p-10">
          {/* Logo & 标题 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📔</div>
            <h1 className="text-3xl font-bold text-diary-900 mb-2">
              我的小日记
            </h1>
            <p className="text-diary-600 text-sm">
              记录每一个温暖的瞬间 ✨
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-diary-600 text-sm">
                <span>📧</span>
                <span>邮箱地址</span>
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="你的邮箱"
                className="
                  w-full px-4 py-3.5
                  bg-diary-50
                  border border-diary-200
                  rounded-xl
                  text-diary-900
                  placeholder:text-diary-400
                  focus:outline-none focus:ring-2 focus:ring-diary-400/50 focus:border-diary-400 focus:bg-white
                  transition-all duration-300
                "
              />
            </div>

            {/* 密码输入 */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-diary-600 text-sm">
                <span>🔒</span>
                <span>密码</span>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="你的密码"
                className="
                  w-full px-4 py-3.5
                  bg-diary-50
                  border border-diary-200
                  rounded-xl
                  text-diary-900
                  placeholder:text-diary-400
                  focus:outline-none focus:ring-2 focus:ring-diary-400/50 focus:border-diary-400 focus:bg-white
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
                bg-gradient-to-r from-diary-500 to-orange-500
                hover:from-diary-600 hover:to-orange-600
                text-white font-semibold
                rounded-xl
                shadow-lg shadow-diary-300/50 hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                hover:-translate-y-0.5 active:translate-y-0
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? '🌱' : '✨'}</span>
                  <span>{isSignUp ? '开始记录' : '开启日记'}</span>
                </>
              )}
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
                className="text-sm text-diary-600 hover:text-diary-800 transition-colors font-medium"
              >
                {isSignUp ? '已有账号？立即登录 👉' : '没有账号？立即注册 ✍️'}
              </button>
            </div>

            {/* 重发邮件 */}
            {showResendEmail && (
              <div className="text-center animate-fade-in">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-sm text-diary-500 hover:text-diary-700 transition-colors disabled:opacity-50"
                >
                  📬 没收到邮件？点击重新发送
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 底部装饰文字 */}
        <p className="text-center text-sm text-diary-600 mt-6">
          用文字拥抱每一个平凡的日子 💕
        </p>
      </div>
    </div>
  );
}
