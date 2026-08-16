import { supabase } from '../src/lib/supabase'; // Adjust based on env, wait, in api we usually init supabase or don't need it if we just use resend. But we need to update ticket status. Let's just use Resend for the email part here, and client side will update Supabase.

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, subject, replyText, originalMessage } = req.body;
    if (!email || !subject || !replyText) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "Missing RESEND_API_KEY Environment Variable" });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KlarElle Support <support@klarelle.store>',
        to: email,
        subject: `Re: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <p style="font-size: 16px; line-height: 1.6; color: #444; white-space: pre-wrap;">${replyText}</p>
            <br/>
            <p style="font-size: 14px; color: #666;">
              Best regards,<br/>
              KlarElle Support Team
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <div style="color: #999; font-size: 13px;">
              <p>On your previous message regarding <strong>${subject}</strong>:</p>
              <blockquote style="border-left: 3px solid #ddd; padding-left: 10px; margin-left: 0; white-space: pre-wrap;">${originalMessage || 'N/A'}</blockquote>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Exception in reply-support-ticket:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
