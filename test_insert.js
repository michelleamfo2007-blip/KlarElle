import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log("Testing insert into order_items...");
  // I will use an existing product ID and the test order ID from earlier.
  // First, get the last order we just created
  const { data: order } = await supabase.from('orders').select('id').order('created_at', { ascending: false }).limit(1).single();
  const { data: product } = await supabase.from('products').select('id').limit(1).single();
  
  if (!order || !product) {
      console.log("Cannot test order_items: missing order or product.");
      return;
  }

  const { data, error } = await supabase.from('order_items').insert([{
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    price_at_time: 100
  }]);
  
  if (error) {
    console.error("ERROR in order_items:", error.message);
  } else {
    console.log("SUCCESS inserting to order_items");
  }
}

test();
