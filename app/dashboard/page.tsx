'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Note } from '@/lib/supabase';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Mindful Diary
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            退出登录
          </button>
        </div>

        {/* Note Editor */}
        <NoteEditor onSave={fetchNotes} />

        {/* Notes List */}
        <NoteList notes={notes} onUpdate={fetchNotes} />
      </div>
    </div>
  );
}
