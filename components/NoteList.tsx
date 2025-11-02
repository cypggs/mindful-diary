'use client';

import { Note } from '@/lib/supabase';
import NoteCard from './NoteCard';

interface NoteListProps {
  notes: Note[];
  onUpdate: () => void;
}

export default function NoteList({ notes, onUpdate }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          还没有日记，快来记录你的想法吧
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={onUpdate} />
      ))}
    </div>
  );
}
