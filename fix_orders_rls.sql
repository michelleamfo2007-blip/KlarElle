-- Drop existing insert policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to order_items" ON public.order_items;

-- Re-create the policy allowing ANYONE (even non-logged-in users) to place an order
CREATE POLICY "Allow public insert to orders" 
ON public.orders FOR INSERT 
TO public
WITH CHECK (true);

-- Re-create the policy for the cart items inside that order
CREATE POLICY "Allow public insert to order_items" 
ON public.order_items FOR INSERT 
TO public
WITH CHECK (true);
