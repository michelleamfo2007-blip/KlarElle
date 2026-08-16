-- Create an RPC to safely increment the coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE coupons
  SET times_used = times_used + 1
  WHERE id = coupon_id;
$$;
