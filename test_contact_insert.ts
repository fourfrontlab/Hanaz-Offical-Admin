import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xipbscxjsfzgkslckpjk.supabase.co';
const supabaseKey = 'sb_publishable_l4rLObIIdRuHilUY7qQI1g_MF0Bb_1-';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const formData = {
    full_name: 'Test Name 2',
    email: 'test2@example.com',
    subject: 'product',
    message: 'This is a test message 2.'
  };

  const { data, error, status, statusText } = await supabase
    .from('contact_messages')
    .insert(formData)
    .select(); // Ask Supabase to return the inserted row

  console.log('Status:', status, statusText);
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
