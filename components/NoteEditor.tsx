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
    <div className="mb-6">
      {/* 主编辑卡片 */}
      <div className={`
        relative overflow-hidden
        bg-white rounded-2xl sm:rounded-3xl
        shadow-lg
        border-2 transition-all duration-300
        ${isFocused
          ? 'border-diary-400 shadow-xl shadow-diary-200/50'
          : 'border-diary-200/50 hover:border-diary-300/50'
        }
      `}>
        {/* 顶部装饰条 */}
        <div className="h-1.5 bg-gradient-to-r from-diary-400 via-orange-400 to-amber-400"></div>

        <div className="p-5 sm:p-6">
          {/* 标题提示 */}
          <div className="flex items-center gap-2 mb-3 text-diary-500 text-sm">
            <span>✏️</span>
            <span>写点什么吧...</span>
          </div>

          {/* 文本输入区 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="此刻的心情、今天的故事、突然的灵感..."
            className="
              w-full min-h-[130px]
              text-diary-800 text-base leading-relaxed
              placeholder:text-diary-300
              bg-transparent
              border-0 focus:ring-0 focus:outline-none
              resize-none
            "
          />

          {/* 分隔线 */}
          <div className="h-px bg-diary-100 my-4"></div>

          {/* 底部工具栏 */}
          <div className="flex items-center justify-between gap-3">
            {/* 心情选择 */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-diary-400 mr-1 hidden sm:inline">今天的心情</span>
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  className={`
                    w-10 h-10 sm:w-11 sm:h-11
                    flex items-center justify-center
                    rounded-xl
                    text-xl
                    transition-all duration-200
                    ${mood === m.value
                      ? 'bg-diary-500 shadow-lg scale-110 -translate-y-1'
                      : 'bg-diary-50 hover:bg-diary-100 hover:scale-105'
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
                px-6 py-2.5
                rounded-xl
                text-sm font-semibold
                transition-all duration-200
                flex items-center gap-2
                ${content.trim() && !saving
                  ? 'bg-gradient-to-r from-diary-500 to-orange-500 text-white shadow-lg shadow-diary-300/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-diary-100 text-diary-300 cursor-not-allowed'
                }
              `}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  保存中
                </>
              ) : (
                <>
                  <span>📝</span>
                  记录
                </>
              )}
            </button>
          </div>

          {/* 快捷键提示 */}
          {content && (
            <div className="mt-3 text-xs text-diary-300 text-right">
              按 Shift + Enter 快速保存
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
