import { supabase } from '../lib/supabase';
import { findProductByParam, productPath } from './productUrl';
import { visitorIsStaff } from './visitor';

export function productParamFromPath(path) {
  const clean = String(path || '').split('?')[0].replace(/\/+$/, '');
  const match = clean.match(/\/product\/([^/]+)$/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export function rankClickedProducts(views = [], products = []) {
  const counts = {};

  for (const row of views) {
    const param = productParamFromPath(row.path);
    if (!param) continue;
    const product = findProductByParam(products, param);
    if (!product) continue;
    if (!counts[product.id]) {
      counts[product.id] = {
        id: product.id,
        name: product.name,
        image: product.image_url,
        clicks: 0
      };
    }
    counts[product.id].clicks += 1;
  }

  return Object.values(counts).sort((a, b) => b.clicks - a.clicks);
}

export async function recordProductPageView(product) {
  if (!product?.id) return;
  if (await visitorIsStaff()) return;

  const sessionId = sessionStorage.getItem('session_id')
    || Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('session_id', sessionId);

  const { error } = await supabase.from('page_views').insert([{
    path: productPath(product),
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    session_id: sessionId
  }]);

  if (error) console.error('Product click was not saved:', error.message);
}
