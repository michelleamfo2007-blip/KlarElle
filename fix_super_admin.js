import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSuperAdmin() {
  const { data, error } = await supabase
    .from('staff')
    .update({ role: 'Super Admin', status: 'Active' })
    .ilike('email', 'okissibiritechnology@gmail.com');
  
  if (error) {
    console.error(error);
  } else {
    console.log('Fixed okissibiritechnology@gmail.com to Super Admin!');
  }
}

fixSuperAdmin();
