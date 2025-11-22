'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Note } from '@/lib/supabase';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';
import SearchBar from '@/components/SearchBar';

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);
    fetchNotes();
  };

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取日记失败:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }
    const query = searchQuery.toLowerCase();
    return notes.filter((note) =>
      note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-diary-50 via-diary-100/50 to-diary-200/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-diary-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-diary-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-diary-600 font-medium animate-pulse">正在打开你的日记本...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-diary-50 via-diary-100/50 to-diary-200/30 relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-diary-300/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-diary-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-diary-300/15 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* 顶部导航栏 - 毛玻璃效果 */}
        <header className="mb-8 animate-slide-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-diary-900 tracking-tight">
                我的日记
              </h1>
              <p className="text-diary-500 text-sm mt-1">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-diary-500 hover:text-diary-700 hover:bg-diary-100 rounded-xl transition-all duration-300"
            >
              退出
            </button>
          </div>
        </header>

        {/* 编辑器区域 */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <NoteEditor onSave={fetchNotes} />
        </div>

        {/* 搜索栏 */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索记忆..."
          />
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mb-4 text-sm text-diary-500 animate-fade-in">
            找到 <span className="font-semibold text-diary-700">{filteredNotes.length}</span> 条相关日记
          </div>
        )}

        {/* 日记列表或空状态 */}
        {filteredNotes.length > 0 ? (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <NoteList notes={filteredNotes} onUpdate={fetchNotes} />
          </div>
        ) : !searchQuery && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-diary-200/50 rounded-3xl rotate-6"></div>
              <div className="absolute inset-0 bg-diary-100 rounded-3xl flex items-center justify-center">
                <svg className="w-12 h-12 text-diary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-diary-800 mb-2">开始记录你的故事</h3>
            <p className="text-diary-500 max-w-xs mx-auto">
              每一天都值得被记住，在上方写下你此刻的想法吧
            </p>
          </div>
        )}

        {/* 底部留白 */}
        <div className="h-10"></div>
      </div>
    </div>
  );
}
