import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xipbscxjsfzgkslckpjk.supabase.co';
const supabaseKey = 'sb_publishable_l4rLObIIdRuHilUY7qQI1g_MF0Bb_1-';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('contact_messages').select('*');
  console.log('Select Data:', data);
  console.log('Select Error:', error);
}
run();
