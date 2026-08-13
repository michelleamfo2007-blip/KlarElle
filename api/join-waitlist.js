export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KlarElle <support@klarelle.store>',
        to: email,
        subject: 'Welcome to the KlarElle Waitlist',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <h1 style="font-family: Georgia, serif; font-weight: normal; margin-bottom: 24px;">Welcome to the list.</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              Thank you for joining the exclusive KlarElle waitlist. You will be the first to know when our new collection drops.
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
    console.error("Exception sending waitlist email:", error);
    return res.status(500).json({ error: error.message });
  }
}
