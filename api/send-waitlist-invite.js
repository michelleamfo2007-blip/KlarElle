export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
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
        from: 'KlarElle <support@klarelle.store>',
        to: email,
        subject: 'You are invited! Welcome to KlarElle',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <h1 style="font-family: Georgia, serif; font-weight: normal; margin-bottom: 24px;">Your exclusive invite is here.</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              Thank you for waiting! We are thrilled to invite you to shop the KlarElle collection.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              <a href="https://klarelle.store/register" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; font-weight: bold; border-radius: 4px;">Click here to create your account and start shopping</a>
            </p>
            <br/>
            <p style="font-size: 16px; color: #444;">
              Warm regards,<br/>
              The KlarElle Team
            </p>
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
    console.error("Exception in send-waitlist-invite:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
