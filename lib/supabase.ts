import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Note = {
  id: string;
  user_id: string;
  content: string;
  mood: 'happy' | 'calm' | 'sad' | 'excited' | 'thoughtful' | 'grateful' | null;
  created_at: string;
  updated_at: string;
};

export type APIToken = {
  id: string;
  user_id: string;
  token: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
};
