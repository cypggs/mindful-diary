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
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl shadow-xl p-6 mb-6 animate-slide-up border border-amber-200/50 dark:border-yellow-700/30">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="记录此刻的想法... 支持 Markdown 语法 | Shift + Enter 快速保存"
        className="w-full h-32 px-4 py-3 border border-amber-200/50 dark:border-yellow-700/30 focus:ring-2 focus:ring-amber-400 rounded-lg resize-none text-amber-900 dark:text-amber-100 bg-white/50 dark:bg-amber-900/20 placeholder-amber-400 dark:placeholder-amber-500 transition-all"
        autoFocus
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? null : m.value)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                mood === m.value
                  ? 'bg-amber-500 text-white scale-105 shadow-md'
                  : 'bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-700/40'
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
