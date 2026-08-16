import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupKhlara() {
  const email = 'Khlarastyledit@gmail.com';
  const name = 'Khlara';
  
  // 1. Call the Vercel API to invite them to Supabase Auth
  try {
    const res = await fetch('https://klarelle.store/api/invite-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'Admin' })
    });
    
    if (!res.ok) {
      console.error('Failed to send invite email via API:', await res.text());
    } else {
      console.log('Successfully sent invite email to Khlara via API!');
    }
  } catch (err) {
    console.error('Error calling invite API:', err);
  }

  // 2. Insert them into the staff table as Admin
  const { error: insertError } = await supabase
    .from('staff')
    .insert([{ email, role: 'Admin', status: 'Pending', name }]);
    
  if (insertError) {
    console.error('Failed to insert into staff table:', insertError);
  } else {
    console.log('Successfully inserted Khlara into staff table!');
  }
}

setupKhlara();
