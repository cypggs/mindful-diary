'use client';

import { useState, memo } from 'react';
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

function NoteCard({ note, onDelete }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这条日记吗？删除后无法恢复哦 😢')) return;

    setIsDeleting(true);

    // Optimistic update - call onDelete immediately
    onDelete();

    // Delete from database in background
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', note.id);

    if (error) {
      alert('删除失败');
      setIsDeleting(false);
      return;
    }

    // Real-time subscription will handle the removal automatically
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
        month: 'numeric',
        day: 'numeric',
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPreview = (text: string) => {
    if (text.length <= 150) return text;
    return text.substring(0, 150) + '...';
  };

  const needsExpansion = note.content.length > 150;

  return (
    <div className={`
      group
      transition-all duration-300
      ${isDeleting ? 'opacity-50 scale-95' : ''}
    `}>
      <div
        onClick={() => needsExpansion && setIsExpanded(!isExpanded)}
        className={`
          relative overflow-hidden
          bg-white rounded-2xl
          shadow-md hover:shadow-lg
          border border-diary-100 hover:border-diary-200
          transition-all duration-300
          ${needsExpansion ? 'cursor-pointer' : ''}
        `}
      >
        {/* 左侧装饰条 */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-diary-400 to-orange-400"></div>

        <div className="pl-5 pr-5 py-5 sm:pl-6 sm:pr-6">
          {/* 顶部元信息 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* 心情 emoji */}
              {note.mood && (
                <div className="w-11 h-11 flex items-center justify-center bg-diary-50 rounded-xl text-2xl">
                  {moodEmojis[note.mood]}
                </div>
              )}
              {/* 时间信息 */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-diary-800">
                    {formatRelativeTime(note.created_at)}
                  </span>
                  <span className="text-diary-300">·</span>
                  <span className="text-xs text-diary-400">
                    {formatTime(note.created_at)}
                  </span>
                </div>
                <p className="text-xs text-diary-400 mt-0.5">
                  {formatFullDate(note.created_at)}
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
                p-2 rounded-lg
                text-diary-300 hover:text-red-500 hover:bg-red-50
                transition-all duration-200
                disabled:opacity-50
              "
              title="删除"
            >
              🗑️
            </button>
          </div>

          {/* 内容区域 */}
          <div className="
            text-diary-700 leading-relaxed
            break-words
            prose prose-sm max-w-none
            prose-headings:text-diary-800 prose-headings:font-semibold
            prose-p:my-2
            prose-a:text-diary-600
            prose-strong:text-diary-800
            prose-code:text-diary-600 prose-code:bg-diary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-ul:my-2 prose-ol:my-2
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {isExpanded ? note.content : getPreview(note.content)}
            </ReactMarkdown>
          </div>

          {/* 展开/收起指示器 */}
          {needsExpansion && (
            <div className="mt-4 pt-3 border-t border-diary-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="
                  w-full
                  flex items-center justify-center gap-1
                  text-xs font-medium text-diary-400
                  hover:text-diary-600
                  transition-colors duration-200
                "
              >
                {isExpanded ? (
                  <>收起 ↑</>
                ) : (
                  <>阅读全文 ↓</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(NoteCard);
