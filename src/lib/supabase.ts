import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 클라이언트 - 환경변수가 없으면 null
export const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

// Supabase가 설정되어 있는지 확인
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// Server-side client for use in Server Components
export function createServerClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
