import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('orders').select('payment_method, payment_status, status, total_amount');
  if (error) {
    console.error('Error:', error);
    return;
  }
  const methods = new Set(data?.map(d => d.payment_method));
  const pStatuses = new Set(data?.map(d => d.payment_status));
  const statuses = new Set(data?.map(d => d.status));
  console.log('payment_methods:', [...methods]);
  console.log('payment_statuses:', [...pStatuses]);
  console.log('statuses:', [...statuses]);
  
  const cods = data?.filter(d => d.payment_method === 'COD' && d.payment_status === 'unpaid' && d.status !== 'Cancelled' && d.status !== 'Returned');
  console.log('Matches with exact COD and unpaid:', cods?.length);
  
  const cods_lower = data?.filter(d => d.payment_method?.toLowerCase() === 'cod' && d.payment_status?.toLowerCase() === 'unpaid' && d.status !== 'Cancelled' && d.status !== 'Returned');
  console.log('Matches with case insensitive cod and unpaid:', cods_lower?.length);
}
run();
