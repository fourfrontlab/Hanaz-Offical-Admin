import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xipbscxjsfzgkslckpjk.supabase.co';
const supabaseKey = 'sb_publishable_l4rLObIIdRuHilUY7qQI1g_MF0Bb_1-';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Signing up...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test_admin_12345@example.com',
    password: 'password123'
  });

  if (authError) {
    console.log('Auth Error:', authError.message);
    // Might already exist, try to login
    await supabase.auth.signInWithPassword({
      email: 'test_admin_12345@example.com',
      password: 'password123'
    });
  }

  const { data, error } = await supabase.from('contact_messages').select('*');
  console.log('Messages:', data);
  console.log('Error:', error);
}
run();
