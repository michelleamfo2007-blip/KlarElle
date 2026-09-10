-- Run this in the Supabase SQL editor so saved-cart emails can send once and honor unsubscribes.

alter table customer_carts
  add column if not exists reminder_sent_at timestamptz;

alter table customer_carts
  add column if not exists reminder_unsubscribed boolean default false;

update customer_carts
  set reminder_unsubscribed = false
  where reminder_unsubscribed is null;

create index if not exists customer_carts_reminder_idx
  on customer_carts (updated_at)
  where reminder_sent_at is null and customer_email is not null and item_count > 0;
