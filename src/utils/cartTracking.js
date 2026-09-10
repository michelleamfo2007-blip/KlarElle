import { supabase } from '../lib/supabase';

function getCartSessionId() {
  const key = 'klarelle_cart_session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export async function logCartActivity({
  action,
  product,
  size,
  color,
  quantity,
  sku,
  email
}) {
  try {
    await supabase.from('cart_activity').insert([{
      session_id: getCartSessionId(),
      customer_email: email || null,
      product_id: product?.id || null,
      product_name: product?.name || null,
      sku: sku || product?.sku || null,
      size: size || null,
      color: color || null,
      quantity: quantity || 1,
      price: product?.price || null,
      image_url: product?.image_url || null,
      action: action || 'add'
    }]);
  } catch (error) {
    console.error('Could not log cart activity:', error);
  }
}

const EMAIL_KEY = 'klarelle_cart_email';

export function rememberCartEmail(email) {
  const cleaned = String(email || '').trim().toLowerCase();
  if (!cleaned.includes('@')) return;
  try {
    localStorage.setItem(EMAIL_KEY, cleaned);
  } catch {
    /* ignore */
  }
}

export function getRememberedCartEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

export async function attachEmailToSavedCart(email) {
  rememberCartEmail(email);
  try {
    const items = JSON.parse(localStorage.getItem('klarelle_cart') || '[]');
    if (Array.isArray(items) && items.length) {
      await saveCartSnapshot(items, email);
    }
  } catch {
    /* ignore */
  }
}

export async function saveCartSnapshot(items, email) {
  try {
    const compact = (items || []).map((item) => ({
      product_id: item.id,
      name: item.name,
      sku: item.sku,
      size: item.selectedSize || null,
      color: item.selectedColor || null,
      quantity: item.quantity || 1,
      price: item.price || 0,
      image_url: item.image_url || null
    }));
    await supabase.from('customer_carts').upsert({
      session_id: getCartSessionId(),
      customer_email: email || getRememberedCartEmail() || null,
      items: compact,
      item_count: compact.reduce((sum, item) => sum + (item.quantity || 0), 0),
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id' });
  } catch (error) {
    console.error('Could not save cart snapshot:', error);
  }
}
