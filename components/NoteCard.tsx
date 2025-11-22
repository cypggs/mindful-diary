'use client';

import { useState } from 'react';
import { Note } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const moodEmojis: Record<string, string> = {
  happy: '😊',
  calm: '😌',
  sad: '😢',
  excited: '🎉',
  thoughtful: '🤔',
  grateful: '🙏',
};

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
}

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这条日记吗？')) return;

    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', note.id);

    if (error) {
      alert('删除失败');
      return;
    }

    onDelete();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const formatFullTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 获取内容预览（前100个字符）
  const getPreview = (text: string) => {
    if (text.length <= 100) return text;
    return text.substring(0, 100) + '...';
  };

  return (
    <div className="animate-fade-in">
      {/* 纸张卡片 */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-amber-200/50 dark:border-yellow-700/30"
        style={{
          background: isExpanded
            ? 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)'
            : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        }}
      >
        <div className="p-6">
          {/* 顶部：时间和操作按钮 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {note.mood && (
                  <span className="text-xl" title={note.mood}>
                    {moodEmojis[note.mood]}
                  </span>
                )}
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {formatRelativeTime(note.created_at)}
                </span>
                <span className="text-xs text-amber-600/70 dark:text-amber-300/70">
                  {formatFullTimestamp(note.created_at).split(' ')[0].replace(/\//g, '/')} {formatFullTimestamp(note.created_at).split(' ')[1]}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-amber-400 hover:text-red-600 transition-colors opacity-60 hover:opacity-100"
              title="删除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* 内容区域 */}
          <div
            className={`text-amber-900 dark:text-amber-100 leading-relaxed break-words overflow-wrap-anywhere prose prose-amber dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:text-amber-900 dark:prose-headings:text-amber-100 ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {isExpanded ? note.content : getPreview(note.content)}
            </ReactMarkdown>
          </div>

          {/* 展开/收起提示 */}
          {note.content.length > 100 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {isExpanded ? '点击收起 ▲' : '点击展开 ▼'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
