import { createClient } from '@supabase/supabase-js';
import { sendAbandonedCartReminders, unsubscribeCartEmail } from './_abandoned-cart.js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY Environment Variable in Vercel.');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'KlarElle <support@klarelle.store>',
      to,
      subject,
      html
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send email');
  }
}

function isCronAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  const auth = String(req.headers.authorization || '');
  if (secret && auth === `Bearer ${secret}`) return true;
  return String(req.headers['user-agent'] || '').includes('vercel-cron');
}

export default async function handler(req, res) {
  try {
    const action = req.method === 'GET'
      ? String(req.query?.action || '')
      : String(req.body?.action || 'join');

    if (action === 'abandoned-cart') {
      if (!isCronAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const result = await sendAbandonedCartReminders();
      return res.status(200).json(result);
    }

    if (action === 'unsubscribe-cart') {
      const email = req.method === 'GET' ? req.query?.email : req.body?.email;
      const token = req.method === 'GET' ? req.query?.token : req.body?.token;
      const result = await unsubscribeCartEmail(email, token);
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const message = result.ok
          ? 'You have been unsubscribed from KlarElle cart reminders.'
          : (result.error || 'This unsubscribe link is not valid.');
        return res.status(result.ok ? 200 : 400).send(`<!doctype html><html><body style="font-family:Georgia,serif;background:#FAF9F6;padding:80px 24px;text-align:center;color:#111;"><p style="letter-spacing:3px;text-transform:uppercase;font-size:12px;color:#BCA38F;">KlarElle</p><h1 style="font-weight:400;">${result.ok ? 'Unsubscribed' : 'Link expired'}</h1><p style="color:#555;">${message}</p><p><a href="https://www.klarelle.store" style="color:#111;">Return to KlarElle</a></p></body></html>`);
      }
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
      email,
      phone,
      size,
      productId,
      productName
    } = req.body || {};

    if (action === 'invite') {
      if (!email) return res.status(400).json({ error: 'Email is required' });
      await sendEmail({
        to: email,
        subject: 'You are invited! Welcome to KlarElle',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <h1 style="font-family: Georgia, serif; font-weight: normal; margin-bottom: 24px;">Your exclusive invite is here.</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              Thank you for waiting! We are thrilled to invite you to shop the KlarElle collection.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              <a href="https://www.klarelle.store/register" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; font-weight: bold; border-radius: 4px;">Click here to create your account and start shopping</a>
            </p>
            <p style="font-size: 16px; color: #444;">Warm regards,<br/>The KlarElle Team</p>
          </div>
        `
      });
      return res.status(200).json({ success: true });
    }

    if (action === 'notify') {
      if (!productId) return res.status(400).json({ error: 'Product is required' });
      if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required' });
      const supabase = getSupabase();
      if (!supabase) return res.status(500).json({ error: 'Missing Supabase configuration' });
      const { error } = await supabase.from('product_notify_requests').insert([{
        product_id: productId,
        email: email || null,
        phone: phone || null,
        size: size || null,
        notified: false
      }]);
      if (error) {
        return res.status(500).json({ error: error.message || 'Could not save notify request' });
      }
      return res.status(200).json({ success: true });
    }

    if (action === 'launch') {
      if (!productId) return res.status(400).json({ error: 'Product is required' });
      const supabase = getSupabase();
      if (!supabase) return res.status(500).json({ error: 'Missing Supabase configuration' });

      const { data: requests } = await supabase
        .from('product_notify_requests')
        .select('*')
        .eq('product_id', productId)
        .or('notified.eq.false,notified.is.null');

      const productUrl = `https://www.klarelle.store/product/${productId}`;
      const name = productName || 'your KlarElle dress';
      const emails = [...new Set((requests || []).map((row) => row.email).filter(Boolean))];

      for (const to of emails) {
        try {
          await sendEmail({
            to,
            subject: `${name} is now available at KlarElle`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
                <h1 style="font-family: Georgia, serif; font-weight: normal; margin-bottom: 24px;">It's here.</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #444;">
                  ${name} is now available. Shop it before it sells out.
                </p>
                <p>
                  <a href="${productUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; font-weight: bold;">Shop now</a>
                </p>
                <p style="font-size: 16px; color: #444;">Warm regards,<br/>The KlarElle Team</p>
              </div>
            `
          });
        } catch (err) {
          console.error('Launch email failed', to, err);
        }
      }

      await supabase.from('product_notify_requests').update({ notified: true }).eq('product_id', productId);
      const { data: product } = await supabase.from('products').select('tags').eq('id', productId).maybeSingle();
      const tags = Array.isArray(product?.tags)
        ? product.tags.filter((tag) => String(tag).toLowerCase() !== 'coming-soon')
        : [];
      await supabase.from('products').update({ coming_soon: false, tags }).eq('id', productId);
      return res.status(200).json({ success: true, emailed: emails.length });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await sendEmail({
      to: email,
      subject: 'Welcome to the KlarElle Waitlist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h1 style="font-family: Georgia, serif; font-weight: normal; margin-bottom: 24px;">Welcome to the list.</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Thank you for joining the KlarElle VIP list. You will get first access and exclusive updates as we launch this September.
          </p>
          <p style="font-size: 16px; color: #444;">Warm regards,<br/>The KlarElle Team</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Exception in join-waitlist:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
