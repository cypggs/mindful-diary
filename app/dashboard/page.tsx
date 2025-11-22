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

  // 获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了，还在思考什么呢？';
    if (hour < 9) return '早安，新的一天开始啦 ☀️';
    if (hour < 12) return '上午好，今天心情怎么样？';
    if (hour < 14) return '中午好，记得休息一下哦';
    if (hour < 18) return '下午好，有什么想记录的吗？';
    if (hour < 22) return '晚上好，来记录今天的故事吧';
    return '夜深了，睡前写点什么吧 🌙';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-diary-100 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-diary-200/50"></div>
            <div className="absolute inset-2 rounded-full bg-diary-100 flex items-center justify-center">
              <span className="text-3xl animate-pulse">📖</span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-diary-400 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-diary-700 font-medium">正在翻开你的日记本...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-diary-100 via-orange-50 to-amber-100 relative">
      {/* 温暖的装饰背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-diary-200/40 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-diary-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-300/25 rounded-full blur-2xl"></div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* 顶部导航栏 */}
        <header className="mb-6 animate-slide-down">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-diary-900 mb-1">
                我的小日记 📔
              </h1>
              <p className="text-diary-600 text-sm">
                {getGreeting()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 px-4 py-2 text-sm text-diary-500 hover:text-diary-700 hover:bg-diary-100/50 rounded-xl transition-all duration-300"
            >
              👋 退出
            </button>
          </div>
        </header>

        {/* 编辑器区域 */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <NoteEditor onSave={fetchNotes} />
        </div>

        {/* 搜索栏 */}
        {notes.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="在记忆中搜索..."
            />
          </div>
        )}

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mb-4 text-sm text-diary-600 animate-fade-in flex items-center gap-2">
            <span>🔍</span>
            找到 <span className="font-semibold text-diary-800">{filteredNotes.length}</span> 条相关记忆
          </div>
        )}

        {/* 日记列表或空状态 */}
        {filteredNotes.length > 0 ? (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4 text-diary-600 text-sm">
              <span>📚</span>
              <span>共 {notes.length} 篇日记</span>
            </div>
            <NoteList notes={filteredNotes} onUpdate={fetchNotes} />
          </div>
        ) : !searchQuery && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-6">🌱</div>
            <h3 className="text-xl font-semibold text-diary-800 mb-2">
              这里还空空的呢
            </h3>
            <p className="text-diary-600 max-w-xs mx-auto leading-relaxed">
              每一段文字都是生命的痕迹<br/>
              写下第一篇日记，开始你的故事吧
            </p>
          </div>
        )}

        {/* 温暖的底部 */}
        <div className="mt-10 text-center text-xs text-diary-400">
          <p>用文字拥抱每一个平凡的日子 💕</p>
        </div>
      </div>
    </div>
  );
}
