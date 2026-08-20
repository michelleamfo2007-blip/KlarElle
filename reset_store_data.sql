-- DANGER: This will permanently delete ALL orders, deliveries, and revenue data from your database.
-- Run this in your Supabase SQL Editor.

-- Clear all orders (this will likely cascade to order_items)
DELETE FROM public.orders;

-- Clear any return requests
DELETE FROM public.return_requests;

-- If you have a deliveries table, clear it (uncomment if applicable)
-- DELETE FROM public.deliveries;

-- If you have wallet transactions, clear them (uncomment if applicable)
-- DELETE FROM public.wallet_transactions;
