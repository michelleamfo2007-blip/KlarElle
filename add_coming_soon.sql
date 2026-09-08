alter table products add column if not exists coming_soon boolean default false;
alter table products add column if not exists release_date date;

create table if not exists product_notify_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  email text,
  phone text,
  size text,
  notified boolean default false,
  created_at timestamptz default now()
);
