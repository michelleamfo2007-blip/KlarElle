import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.klarelle.store';
const FROM = 'KlarElle <support@klarelle.store>';
const MIN_IDLE_MS = 20 * 60 * 60 * 1000;
const MAX_IDLE_MS = 6 * 24 * 60 * 60 * 1000;
const MAX_SENDS = 20;

function emailImageUrl(url) {
  if (!url) return '';
  const abs = String(url).startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  if (!abs.includes('res.cloudinary.com') || !abs.includes('/upload/')) return abs;
  if (/\/upload\/[^/]*f_jpg/.test(abs)) return abs;
  return abs.replace('/upload/', '/upload/f_jpg,q_auto,w_400/');
}

function tokenSecret() {
  return process.env.CRON_SECRET || process.env.RESEND_API_KEY || 'klarelle-cart';
}

export function cartReminderToken(email) {
  return createHmac('sha256', tokenSecret()).update(String(email || '').trim().toLowerCase()).digest('hex').slice(0, 24);
}

export function unsubscribeUrl(email) {
  const to = encodeURIComponent(String(email || '').trim().toLowerCase());
  return `${SITE_URL}/api/join-waitlist?action=unsubscribe-cart&email=${to}&token=${cartReminderToken(email)}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '';
  return `$${amount.toFixed(2)}`;
}

function itemLine(item) {
  const size = item.size ? `Size ${item.size}` : '';
  const color = item.color && !/^standard$/i.test(String(item.color)) ? item.color : '';
  return [size, color].filter(Boolean).join(' · ');
}

function cartEmail(cart) {
  const items = Array.isArray(cart.items) ? cart.items.slice(0, 4) : [];
  const unsub = unsubscribeUrl(cart.customer_email);
  const rows = items.map((item) => {
    const image = emailImageUrl(item.image_url);
    const detail = itemLine(item);
    const qty = item.quantity > 1 ? ` × ${item.quantity}` : '';
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; vertical-align: top;">
          ${image ? `<img src="${escapeHtml(image)}" alt="" width="72" height="96" style="display:block;width:72px;height:96px;object-fit:cover;border-radius:2px;" />` : ''}
        </td>
        <td style="padding: 12px 0 12px 16px; border-bottom: 1px solid #eee; vertical-align: top;">
          <div style="font-size: 15px; color: #111;">${escapeHtml(item.name || 'KlarElle dress')}</div>
          ${detail ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">${escapeHtml(detail)}${qty}</div>` : ''}
          ${item.price ? `<div style="font-size: 13px; color: #111; margin-top: 6px;">${formatMoney(item.price)}</div>` : ''}
        </td>
      </tr>`;
  }).join('');

  const html = `
    <div style="background:#FAF9F6;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
      <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px 32px;color:#111;">
        <p style="letter-spacing:3px;text-transform:uppercase;font-size:11px;color:#BCA38F;margin:0 0 24px;font-family:Arial,sans-serif;">KlarElle</p>
        <h1 style="font-weight:400;font-size:28px;line-height:1.3;margin:0 0 16px;">Your selection is still here</h1>
        <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#444;margin:0 0 24px;">
          Hello,<br/><br/>
          You left ${items.length === 1 ? 'a piece' : 'a few pieces'} in your KlarElle cart. It is saved if you would like to continue when you are ready.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${rows}</table>
        <p style="text-align:center;margin:32px 0 8px;font-family:Arial,sans-serif;">
          <a href="${SITE_URL}/cart" style="display:inline-block;padding:14px 28px;background:#111;color:#fff;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Return to your cart</a>
        </p>
        <p style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#666;margin:24px 0 0;">
          With care,<br/>KlarElle<br/>
          <a href="${SITE_URL}" style="color:#111;">www.klarelle.store</a> · <a href="mailto:support@klarelle.store" style="color:#111;">support@klarelle.store</a>
        </p>
        <p style="font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:#999;margin:28px 0 0;border-top:1px solid #eee;padding-top:16px;">
          You received this because items were added to a cart on KlarElle. This is not a receipt.
          <a href="${unsub}" style="color:#666;">Unsubscribe from cart reminders</a>.
        </p>
      </div>
    </div>`;

  const text = [
    'Your KlarElle selection is still here',
    '',
    'Hello,',
    '',
    `You left ${items.length === 1 ? 'a piece' : 'a few pieces'} in your KlarElle cart. It is saved if you would like to continue when you are ready.`,
    '',
    ...items.map((item) => `- ${item.name || 'KlarElle dress'}${itemLine(item) ? ` (${itemLine(item)})` : ''}`),
    '',
    `Return to your cart: ${SITE_URL}/cart`,
    '',
    'KlarElle',
    'support@klarelle.store',
    SITE_URL,
    '',
    `Unsubscribe from cart reminders: ${unsub}`
  ].join('\n');

  return { html, text, unsub };
}

async function alreadyOrdered(supabase, email, since) {
  const { data } = await supabase
    .from('orders')
    .select('id')
    .ilike('customer_email', email)
    .gte('created_at', since)
    .limit(1);
  return Boolean(data?.length);
}

export async function unsubscribeCartEmail(email, token) {
  const to = String(email || '').trim().toLowerCase();
  if (!to.includes('@') || token !== cartReminderToken(to)) {
    return { ok: false, error: 'This unsubscribe link is not valid.' };
  }
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from('customer_carts')
    .update({ reminder_unsubscribed: true, reminder_sent_at: new Date().toISOString() })
    .ilike('customer_email', to);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendAbandonedCartReminders() {
  if (!process.env.RESEND_API_KEY || !process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing RESEND_API_KEY or Supabase configuration.');
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = Date.now();
  const { data: carts, error } = await supabase
    .from('customer_carts')
    .select('session_id, customer_email, items, item_count, updated_at, reminder_sent_at, reminder_unsubscribed')
    .gt('item_count', 0)
    .not('customer_email', 'is', null)
    .is('reminder_sent_at', null)
    .or('reminder_unsubscribed.eq.false,reminder_unsubscribed.is.null')
    .lt('updated_at', new Date(now - MIN_IDLE_MS).toISOString())
    .gt('updated_at', new Date(now - MAX_IDLE_MS).toISOString())
    .limit(40);

  if (error) {
    throw new Error(error.message.includes('reminder_')
      ? 'Run add_abandoned_cart.sql in Supabase, then wait for the next daily send.'
      : error.message);
  }

  let sent = 0;
  const skipped = [];

  for (const cart of carts || []) {
    if (sent >= MAX_SENDS) break;
    const email = String(cart.customer_email || '').trim().toLowerCase();
    if (!email.includes('@')) continue;
    if (await alreadyOrdered(supabase, email, cart.updated_at)) {
      await supabase.from('customer_carts').update({ reminder_sent_at: new Date().toISOString() }).eq('session_id', cart.session_id);
      skipped.push('ordered');
      continue;
    }

    const { html, text, unsub } = cartEmail(cart);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: email,
        reply_to: 'support@klarelle.store',
        subject: 'Your KlarElle selection is still here',
        html,
        text,
        headers: {
          'List-Unsubscribe': `<${unsub}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      })
    });

    if (!response.ok) {
      const body = await response.text();
      skipped.push(body.slice(0, 120));
      continue;
    }

    await supabase
      .from('customer_carts')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('session_id', cart.session_id);
    sent += 1;
  }

  return { success: true, sent, considered: (carts || []).length };
}
