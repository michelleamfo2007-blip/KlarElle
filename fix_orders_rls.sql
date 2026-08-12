-- Run this in your Supabase SQL Editor to allow customers to place orders

-- 1. Enable RLS on orders and order_items (just in case they aren't enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2. Create policies to allow ANYONE (including guests) to insert orders
CREATE POLICY "Allow public insert on orders" ON orders
    FOR INSERT WITH CHECK (true);

-- 3. Create policies to allow ANYONE (including guests) to insert order items
CREATE POLICY "Allow public insert on order_items" ON order_items
    FOR INSERT WITH CHECK (true);

-- 4. Ensure authenticated users (Admins) have full access
CREATE POLICY "Allow authenticated full access to orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to order_items" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');
