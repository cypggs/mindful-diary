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
        .from('notes')
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 animate-slide-up">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="记录此刻的想法..."
        className="w-full h-32 px-4 py-3 border-0 focus:ring-2 focus:ring-indigo-500 rounded-lg resize-none text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
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
                  ? 'bg-indigo-600 text-white scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
