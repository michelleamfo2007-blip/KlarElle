-- Run this in the Supabase SQL editor so admin can see what customers add to cart.

create table if not exists cart_activity (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  customer_email text,
  product_id uuid,
  product_name text,
  sku text,
  size text,
  color text,
  quantity int default 1,
  price numeric,
  image_url text,
  action text default 'add',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists customer_carts (
  session_id text primary key,
  customer_email text,
  items jsonb default '[]',
  item_count int default 0,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table cart_activity enable row level security;
alter table customer_carts enable row level security;

drop policy if exists "Allow anonymous inserts for cart activity" on cart_activity;
create policy "Allow anonymous inserts for cart activity"
  on cart_activity for insert
  with check (true);

drop policy if exists "Allow authenticated read for cart activity" on cart_activity;
create policy "Allow authenticated read for cart activity"
  on cart_activity for select
  to authenticated
  using (true);

drop policy if exists "Allow anonymous upsert for customer carts" on customer_carts;
create policy "Allow anonymous upsert for customer carts"
  on customer_carts for insert
  with check (true);

drop policy if exists "Allow anonymous update for customer carts" on customer_carts;
create policy "Allow anonymous update for customer carts"
  on customer_carts for update
  using (true)
  with check (true);

drop policy if exists "Allow authenticated read for customer carts" on customer_carts;
create policy "Allow authenticated read for customer carts"
  on customer_carts for select
  to authenticated
  using (true);
