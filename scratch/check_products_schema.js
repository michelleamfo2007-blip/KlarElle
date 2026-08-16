import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    if (data.length > 0) {
      console.log('Columns in products table:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No products found to check schema. Trying to get an empty result set to check columns...');
      const { data: emptyData, error: emptyError } = await supabase.from('products').select('*').limit(0);
      if(emptyError) {
          console.error('Error:', emptyError);
      } else {
          console.log('Table exists, but we cant get columns from empty result easily via REST without data.');
      }
    }
  }
}

checkSchema();
