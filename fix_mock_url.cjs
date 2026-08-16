require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      shipping_label_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
    })
    .eq('shipping_label_url', 'https://shippo-delivery-mock-label.pdf');
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Successfully updated the mock URLs in the database.");
  }
}

fix();
