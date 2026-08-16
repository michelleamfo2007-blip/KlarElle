require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('run_sql', { sql: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide_url text;` });
  
  if (error) {
    console.error("RPC failed, trying raw query...", error);
    // fallback if no run_sql RPC exists: since I can't run raw DDL via supabase-js without an RPC, 
    // I can just tell the user to run it in SQL editor OR wait for the supabase CLI task
  } else {
    console.log("Success");
  }
}

run();
