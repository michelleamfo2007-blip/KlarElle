import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeMichelle() {
  const { error } = await supabase
    .from('staff')
    .delete()
    .ilike('email', 'michelleamfo2007@gmail.com');
  
  if (error) {
    console.error('Error removing Michelle:', error);
  } else {
    console.log('Successfully removed Michelle from the database.');
  }
}

removeMichelle();
