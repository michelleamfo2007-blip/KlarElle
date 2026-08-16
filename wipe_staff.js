import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeStaff() {
  const { error } = await supabase
    .from('staff')
    .delete()
    .neq('email', 'fake-email-that-will-never-match@test.com'); // Deletes all rows
  
  if (error) {
    console.error('Error wiping staff:', error);
  } else {
    console.log('Successfully wiped all staff from the database.');
  }
}

wipeStaff();
