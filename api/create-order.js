import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderEmails } from './_send-order-emails.js';
import { deductInventoryForItems } from './_deduct-inventory.js';
import { isTestShopper } from '../src/utils/launch.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    payment_intent_id,
    customer_name,
    customer_email,
    total_amount,
    shipping_address,
    phone_number,
    shipping_provider,
    shipping_service,
    shippo_rate_id,
    items,
    coupon_id
  } = req.body || {};

  if (!payment_intent_id) {
    return res.status(400).json({ error: 'Missing payment_intent_id' });
  }

  if (!customer_email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Email and at least one item are required.' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing server environment variables' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not completed successfully.' });
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const existing = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', payment_intent_id)
      .maybeSingle();

    if (!existing.error && existing.data?.id) {
      return res.status(200).json({ order_id: existing.data.id, already_created: true });
    }

    const testOrder = isTestShopper(customer_email);
    const orderPayload = {
      customer_name: (customer_name || 'Guest').trim() || 'Guest',
      customer_email,
      total_amount,
      status: testOrder ? 'Delivered' : 'Paid',
      shipping_address: typeof shipping_address === 'string'
        ? shipping_address
        : JSON.stringify(shipping_address || {}),
      phone_number: phone_number || null,
      shipping_provider: shipping_provider || 'Standard',
      shipping_service: shipping_service || 'Shipping',
      shippo_rate_id: shippo_rate_id || null,
      payment_intent_id,
      fulfilled_from: req.body.fulfilled_from || null
    };

    let orderData;
    let orderError;
    ({ data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select('id')
      .single());

    for (let attempt = 0; attempt < 2 && orderError && /column/i.test(orderError.message); attempt += 1) {
      if (/payment_intent_id/i.test(orderError.message)) delete orderPayload.payment_intent_id;
      if (/fulfilled_from/i.test(orderError.message)) delete orderPayload.fulfilled_from;
      ({ data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single());
    }

    if (orderError && /duplicate|unique/i.test(orderError.message)) {
      const { data: duplicate } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_intent_id', payment_intent_id)
        .maybeSingle();
      if (duplicate?.id) {
        return res.status(200).json({ order_id: duplicate.id, already_created: true });
      }
    }

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time || 0,
      size: item.size || null,
      color: item.color || null
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    if (!testOrder) {
      try {
        await deductInventoryForItems(supabase, items);
      } catch (stockError) {
        console.error('Order saved but inventory deduct failed:', stockError);
      }
    }

    if (coupon_id) {
      await supabase.rpc('increment_coupon_usage', { coupon_id });
    }

    try {
      await sendOrderEmails(orderData.id);
    } catch (emailError) {
      console.error('Order saved but email failed:', emailError);
    }

    return res.status(200).json({ order_id: orderData.id });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(400).json({ error: error.message || 'Failed to save order' });
  }
}
