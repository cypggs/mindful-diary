'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Mood = 'happy' | 'calm' | 'sad' | 'excited' | 'thoughtful' | 'grateful' | null;

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'sad', label: '难过', emoji: '😢' },
  { value: 'excited', label: '兴奋', emoji: '🎉' },
  { value: 'thoughtful', label: '沉思', emoji: '🤔' },
  { value: 'grateful', label: '感恩', emoji: '🙏' },
];

interface NoteEditorProps {
  onSave: () => void;
}

export default function NoteEditor({ onSave }: NoteEditorProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>(null);
  const [saving, setSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const { error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            mood,
          },
        ]);

      if (error) throw error;

      setContent('');
      setMood(null);
      onSave();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className={`mb-6 transition-all duration-500 ${isFocused ? 'scale-[1.01]' : ''}`}>
      {/* 主编辑卡片 */}
      <div className={`
        relative bg-white/80 backdrop-blur-xl rounded-3xl
        shadow-soft hover:shadow-soft-lg
        border border-diary-200/50
        transition-all duration-500
        ${isFocused ? 'shadow-glow ring-2 ring-diary-300/50' : ''}
      `}>
        {/* 内部容器 */}
        <div className="p-5 sm:p-6">
          {/* 文本输入区 */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="今天想记录点什么..."
              className="
                w-full min-h-[120px] sm:min-h-[140px]
                px-1 py-2
                text-diary-900 text-base sm:text-lg leading-relaxed
                placeholder:text-diary-300
                bg-transparent
                border-0 focus:ring-0 focus:outline-none
                resize-none
                transition-all duration-300
              "
            />
            {/* 底部提示 */}
            <div className={`
              absolute bottom-0 right-0 text-xs text-diary-300
              transition-opacity duration-300
              ${content ? 'opacity-100' : 'opacity-0'}
            `}>
              Shift + Enter 保存
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-diary-200 to-transparent my-4"></div>

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between gap-4">
            {/* 心情选择 */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xs text-diary-400 mr-1 hidden sm:inline">心情</span>
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10
                    flex items-center justify-center
                    rounded-xl sm:rounded-2xl
                    text-lg sm:text-xl
                    transition-all duration-300
                    ${mood === m.value
                      ? 'bg-diary-500 shadow-md scale-110 -translate-y-0.5'
                      : 'bg-diary-100/50 hover:bg-diary-100 hover:scale-105'
                    }
                  `}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className={`
                px-5 sm:px-6 py-2.5 sm:py-3
                rounded-xl sm:rounded-2xl
                text-sm font-semibold
                transition-all duration-300
                ${content.trim() && !saving
                  ? 'bg-diary-500 text-white shadow-md hover:bg-diary-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-diary-100 text-diary-300 cursor-not-allowed'
                }
              `}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  保存中
                </span>
              ) : '记录'}
            </button>
          </div>
        </div>
      </div>

      {/* 支持 Markdown 提示 */}
      <p className="text-center text-xs text-diary-300 mt-3">
        支持 Markdown 语法
      </p>
    </div>
  );
}
