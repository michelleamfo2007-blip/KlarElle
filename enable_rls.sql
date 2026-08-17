-- ENABLE RLS ON ALL TABLES
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- CLEANUP EXISTING POLICIES TO PREVENT DUPLICATES
DROP POLICY IF EXISTS "Products_Public_Read" ON public.products;
DROP POLICY IF EXISTS "Products_Admin_All" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated full access to products" ON public.products;

DROP POLICY IF EXISTS "Orders_Public_Insert" ON public.orders;
DROP POLICY IF EXISTS "Orders_Admin_All" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated full access to orders" ON public.orders;

DROP POLICY IF EXISTS "OrderItems_Public_Insert" ON public.order_items;
DROP POLICY IF EXISTS "OrderItems_Admin_All" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated full access to order_items" ON public.order_items;

DROP POLICY IF EXISTS "Coupons_Public_Read" ON public.coupons;
DROP POLICY IF EXISTS "Coupons_Admin_All" ON public.coupons;
DROP POLICY IF EXISTS "Allow public read access to active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow authenticated full access to coupons" ON public.coupons;

DROP POLICY IF EXISTS "Staff_Admin_All" ON public.staff;
DROP POLICY IF EXISTS "Allow public read access to staff" ON public.staff;
DROP POLICY IF EXISTS "Allow public insert access to staff" ON public.staff;
DROP POLICY IF EXISTS "Allow public update access to staff" ON public.staff;
DROP POLICY IF EXISTS "Allow public delete access to staff" ON public.staff;

DROP POLICY IF EXISTS "Settings_Public_Read" ON public.store_settings;
DROP POLICY IF EXISTS "Settings_Admin_All" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public read access to store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow authenticated update access to store_settings" ON public.store_settings;

DROP POLICY IF EXISTS "SupportTickets_Public_Insert" ON public.support_tickets;
DROP POLICY IF EXISTS "SupportTickets_Admin_All" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow public to insert support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow authenticated to view support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow authenticated to update support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow authenticated to delete support tickets" ON public.support_tickets;

DROP POLICY IF EXISTS "WebsiteContent_Public_Read" ON public.website_content;
DROP POLICY IF EXISTS "WebsiteContent_Admin_All" ON public.website_content;
DROP POLICY IF EXISTS "Allow public read access to website_content" ON public.website_content;
DROP POLICY IF EXISTS "Allow authenticated update access to website_content" ON public.website_content;

DROP POLICY IF EXISTS "Reviews_Public_Read" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews_Public_Insert" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews_Public_Update" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews_Admin_All" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public insert to reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public update of helpful_count" ON public.product_reviews;

DROP POLICY IF EXISTS "Subscribers_Public_Insert" ON public.subscribers;
DROP POLICY IF EXISTS "Subscribers_Admin_All" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public insert to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to view subscribers" ON public.subscribers;

DROP POLICY IF EXISTS "Waitlist_Public_Insert" ON public.waitlist;
DROP POLICY IF EXISTS "Waitlist_Admin_All" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public insert to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public read waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public update to waitlist" ON public.waitlist;

DROP POLICY IF EXISTS "Wallets_Public_All" ON public.wallets;
DROP POLICY IF EXISTS "GiftCards_Public_All" ON public.gift_cards;
DROP POLICY IF EXISTS "WalletTransactions_Public_All" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Allow public read access to wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public insert to wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public update to wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public read access to gift_cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Allow public insert to gift_cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Allow public update to gift_cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Allow public read access to transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Allow public insert to transactions" ON public.wallet_transactions;


-- PRODUCTS (Public Read, Admin All)
CREATE POLICY "Products_Public_Read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products_Admin_All" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- ORDERS (Public Insert, Admin All)
CREATE POLICY "Orders_Public_Insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders_Admin_All" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- ORDER_ITEMS (Public Insert, Admin All)
CREATE POLICY "OrderItems_Public_Insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "OrderItems_Admin_All" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- COUPONS (Public Read for checking codes, Admin All)
CREATE POLICY "Coupons_Public_Read" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Coupons_Admin_All" ON public.coupons FOR ALL USING (auth.role() = 'authenticated');

-- STAFF (Admin All)
CREATE POLICY "Staff_Admin_All" ON public.staff FOR ALL USING (auth.role() = 'authenticated');

-- STORE_SETTINGS (Public Read, Admin All)
CREATE POLICY "Settings_Public_Read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Settings_Admin_All" ON public.store_settings FOR ALL USING (auth.role() = 'authenticated');

-- SUPPORT_TICKETS (Public Insert, Admin All)
CREATE POLICY "SupportTickets_Public_Insert" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "SupportTickets_Admin_All" ON public.support_tickets FOR ALL USING (auth.role() = 'authenticated');

-- WEBSITE_CONTENT (Public Read, Admin All)
CREATE POLICY "WebsiteContent_Public_Read" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "WebsiteContent_Admin_All" ON public.website_content FOR ALL USING (auth.role() = 'authenticated');

-- PRODUCT_REVIEWS (Public Read/Insert/Update for helpfulness)
CREATE POLICY "Reviews_Public_Read" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Reviews_Public_Insert" ON public.product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Reviews_Public_Update" ON public.product_reviews FOR UPDATE USING (true);
CREATE POLICY "Reviews_Admin_All" ON public.product_reviews FOR ALL USING (auth.role() = 'authenticated');

-- SUBSCRIBERS (Public Insert, Admin All)
CREATE POLICY "Subscribers_Public_Insert" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Subscribers_Admin_All" ON public.subscribers FOR ALL USING (auth.role() = 'authenticated');

-- WAITLIST (Public Insert, Admin All)
CREATE POLICY "Waitlist_Public_Insert" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Waitlist_Admin_All" ON public.waitlist FOR ALL USING (auth.role() = 'authenticated');

-- WALLETS, GIFT CARDS, TRANSACTIONS (Public Select/Insert/Update, Admin All)
CREATE POLICY "Wallets_Public_All" ON public.wallets FOR ALL USING (true);
CREATE POLICY "GiftCards_Public_All" ON public.gift_cards FOR ALL USING (true);
CREATE POLICY "WalletTransactions_Public_All" ON public.wallet_transactions FOR ALL USING (true);
