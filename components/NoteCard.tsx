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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这条日记吗？')) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', note.id);

    if (error) {
      alert('删除失败');
      setIsDeleting(false);
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
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPreview = (text: string) => {
    if (text.length <= 120) return text;
    return text.substring(0, 120) + '...';
  };

  const needsExpansion = note.content.length > 120;

  return (
    <div className={`
      group
      animate-scale-in
      transition-all duration-500
      ${isDeleting ? 'opacity-50 scale-95' : ''}
    `}>
      <div
        onClick={() => needsExpansion && setIsExpanded(!isExpanded)}
        className={`
          relative
          bg-white/70 backdrop-blur-lg
          rounded-2xl sm:rounded-3xl
          border border-diary-100
          shadow-soft
          hover:shadow-soft-lg hover:bg-white/80
          transition-all duration-500
          ${needsExpansion ? 'cursor-pointer' : ''}
          ${isExpanded ? 'ring-2 ring-diary-200/50' : ''}
        `}
      >
        <div className="p-5 sm:p-6">
          {/* 顶部元信息 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* 心情 emoji */}
              {note.mood && (
                <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-diary-100/80 rounded-xl sm:rounded-2xl text-xl sm:text-2xl">
                  {moodEmojis[note.mood]}
                </div>
              )}
              {/* 时间信息 */}
              <div>
                <p className="text-sm font-medium text-diary-700">
                  {formatRelativeTime(note.created_at)}
                </p>
                <p className="text-xs text-diary-400">
                  {formatDate(note.created_at)} · {formatTime(note.created_at)}
                </p>
              </div>
            </div>

            {/* 删除按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="
                opacity-0 group-hover:opacity-100
                p-2 rounded-xl
                text-diary-300 hover:text-red-500 hover:bg-red-50
                transition-all duration-300
                disabled:opacity-50
              "
              title="删除"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>

          {/* 内容区域 */}
          <div className={`
            text-diary-800 leading-relaxed
            break-words overflow-wrap-anywhere
            prose prose-diary max-w-none
            prose-headings:text-diary-900 prose-headings:font-semibold
            prose-p:my-2 prose-p:text-diary-700
            prose-a:text-diary-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-diary-900
            prose-code:text-diary-700 prose-code:bg-diary-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-diary-100/50 prose-pre:border prose-pre:border-diary-200/50
            prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
            transition-all duration-500
          `}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {isExpanded ? note.content : getPreview(note.content)}
            </ReactMarkdown>
          </div>

          {/* 展开/收起指示器 */}
          {needsExpansion && (
            <div className="mt-4 pt-3 border-t border-diary-100/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="
                  w-full
                  flex items-center justify-center gap-2
                  text-xs font-medium text-diary-400
                  hover:text-diary-600
                  transition-colors duration-300
                "
              >
                {isExpanded ? (
                  <>
                    收起
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    展开全文
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
