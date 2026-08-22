import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xipbscxjsfzgkslckpjk.supabase.co';
const supabaseKey = 'sb_publishable_l4rLObIIdRuHilUY7qQI1g_MF0Bb_1-';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing insert to non-existent table...');
  const { data, error, status, statusText } = await supabase
    .from('fake_table_123')
    .insert({ test: 1 });

  console.log('Status:', status);
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
