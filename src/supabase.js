import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fix #12: Removed the incomplete silent mock. Missing config now fails clearly.
  console.error('🚨 SUPABASE CONFIG MISSING – Check your .env file (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) and restart Vite.');
}

// If config is missing, supabase is null and calling code must handle it.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
