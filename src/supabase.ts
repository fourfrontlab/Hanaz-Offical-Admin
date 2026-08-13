import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env file
// Using placeholders for now, the user will need to provide them or we can ask for them.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
