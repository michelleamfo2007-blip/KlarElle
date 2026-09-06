import { sendOrderEmails } from './_send-order-emails.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order_id } = req.body;
    await sendOrderEmails(order_id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Exception in send-order-email:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
