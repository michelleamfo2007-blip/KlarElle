import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await supabase
  .from('products')
  .update({ length: 45, width: 35, height: 5 })
  .neq('id', '00000000-0000-0000-0000-000000000000')
  .select('id');

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Updated ${data?.length || 0} products to 45 x 35 x 5 cm.`);
