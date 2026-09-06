-- Optional: prevents creating the same paid order twice
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_intent_id text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_id_key
ON public.orders (payment_intent_id)
WHERE payment_intent_id IS NOT NULL;
