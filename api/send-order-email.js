import { sendOrderEmails } from './_send-order-emails.js';

async function sendWelcomeEmail(email, name) {
  if (!email) {
    throw new Error('Email is required');
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY');
  }

  const firstName = (name || '').trim().split(' ')[0] || 'there';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'KlarElle <support@klarelle.store>',
      to: email,
      subject: 'Welcome to KlarElle',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="margin: 0; color: #000; font-size: 28px; letter-spacing: 2px;">KlarElle</h1>
            </div>
            <p>Hi ${firstName},</p>
            <p>Welcome to KlarElle. Your account is ready.</p>
            <p>You can now check out faster, save your address, and track your orders in one place.</p>
            <p style="margin: 28px 0;">
              <a href="https://klarelle.store" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; font-weight: bold; border-radius: 4px;">Start shopping</a>
            </p>
            <p>If you have any questions, email us at <a href="mailto:support@klarelle.store">support@klarelle.store</a>.</p>
            <p>With love,<br/>The KlarElle Team<br/><a href="https://www.klarelle.store">www.klarelle.store</a></p>
          </div>
        `
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send welcome email');
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order_id, type, email, name } = req.body || {};

    if (type === 'welcome') {
      await sendWelcomeEmail(email, name);
      return res.status(200).json({ success: true });
    }

    await sendOrderEmails(order_id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Exception in send-order-email:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
