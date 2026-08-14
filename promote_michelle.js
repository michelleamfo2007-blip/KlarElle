import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteMichelle() {
  const email = 'michelleamfo2007@gmail.com';
  
  // Try to update first
  const { data, error } = await supabase
    .from('staff')
    .update({ role: 'Super Admin', status: 'Active', name: 'Michelle' })
    .ilike('email', email);
    
  // If it doesn't exist, we must insert
  const { data: fetchCheck } = await supabase.from('staff').select('*').ilike('email', email).single();
  
  if (!fetchCheck) {
    const { error: insertError } = await supabase
      .from('staff')
      .insert([{ email: email, role: 'Super Admin', status: 'Active', name: 'Michelle' }]);
      
    if (insertError) {
      console.error('Failed to insert Michelle:', insertError);
    } else {
      console.log('Successfully inserted Michelle as Super Admin!');
    }
  } else {
    console.log('Successfully updated Michelle as Super Admin!');
  }
}

promoteMichelle();
