import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🔴 Supabase env vars are not set! ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file ' +
    'AND to the Vercel project settings (Project → Settings → Environment Variables). ' +
    'Then trigger a Vercel redeploy.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
