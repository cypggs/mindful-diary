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

  // 过滤日记
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950 flex items-center justify-center">
        <div className="animate-pulse text-amber-700 dark:text-amber-300 font-medium">
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">
              Mindful Diary
            </h1>
            <p className="text-amber-600 dark:text-amber-400">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors font-medium"
          >
            退出登录
          </button>
        </div>

        {/* Note Editor */}
        <NoteEditor onSave={fetchNotes} />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索日记内容..."
        />

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-amber-700 dark:text-amber-300 font-medium">
            找到 {filteredNotes.length} 条相关日记
          </div>
        )}

        {/* Notes List */}
        <NoteList notes={filteredNotes} onUpdate={fetchNotes} />
      </div>
    </div>
  );
}
