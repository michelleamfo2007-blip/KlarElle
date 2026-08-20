import { supabase } from '../src/lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, returnId, status, details } = req.body;
    if (!email || !returnId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "Missing RESEND_API_KEY Environment Variable" });
    }

    let subject = "";
    let messageHtml = "";

    switch (status) {
      case 'Pending Review':
        subject = `Return Request Received - ${returnId.substring(0,8)}`;
        messageHtml = `
          <p>Hi there,</p>
          <p>We have received your return request for Return #${returnId.substring(0,8).toUpperCase()}.</p>
          <p>Our team is currently reviewing your request. We will notify you once it has been approved or if we need more information.</p>
        `;
        break;
      case 'Approved':
        subject = `Return Approved - Action Required - ${returnId.substring(0,8)}`;
        messageHtml = `
          <p>Hi there,</p>
          <p>Good news! Your return request #${returnId.substring(0,8).toUpperCase()} has been approved.</p>
          <p><strong>Return Instructions:</strong></p>
          <p>Please securely pack the items and ship them to the following address:</p>
          <p style="padding: 10px; background: #f5f5f5; border-radius: 4px;">
            Klarelle Returns<br/>
            123 Fashion Street<br/>
            Suite 400<br/>
            Accra, Ghana
          </p>
          <p>Once you've shipped the package, please log into your account and enter the tracking number on your Orders page so we can track its arrival.</p>
        `;
        break;
      case 'Rejected':
        subject = `Update on your Return Request - ${returnId.substring(0,8)}`;
        messageHtml = `
          <p>Hi there,</p>
          <p>We've reviewed your return request #${returnId.substring(0,8).toUpperCase()}, but unfortunately, we are unable to approve it at this time.</p>
          <p>${details ? `<strong>Reason:</strong> ${details}` : ''}</p>
          <p>If you have any questions or believe this was a mistake, please reply to this email to contact support.</p>
        `;
        break;
      case 'In Transit':
        subject = `Return Tracking Received - ${returnId.substring(0,8)}`;
        messageHtml = `
          <p>Hi there,</p>
          <p>Thank you for providing the tracking number for your return #${returnId.substring(0,8).toUpperCase()}.</p>
          <p>We'll keep an eye out for your package and notify you once it has been received at our facility.</p>
        `;
        break;
      case 'Received':
        subject = `Return Package Received - ${returnId.substring(0,8)}`;
        messageHtml = `
          <p>Hi there,</p>
          <p>We have successfully received your returned items for request #${returnId.substring(0,8).toUpperCase()}!</p>
          <p>Our team will now inspect the items and process your refund or store credit shortly.</p>
        `;
        break;
      case 'Refunded':
        subject = `Refund Processed - ${returnId.substring(0,8)}`;
        messageHtml = `
          <p>Hi there,</p>
          <p>Your return #${returnId.substring(0,8).toUpperCase()} is now complete!</p>
          <p>We have successfully processed your refund/store credit. Please allow 3-7 business days for the funds to reflect in your account, depending on your original payment method.</p>
          <p>Thank you for shopping with Klarelle!</p>
        `;
        break;
      default:
        subject = `Update on Return ${returnId.substring(0,8)}`;
        messageHtml = `<p>Your return request status has been updated to: ${status}</p>`;
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
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            ${messageHtml}
            <br/>
            <p style="font-size: 14px; color: #666;">
              Best regards,<br/>
              KlarElle Support Team
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
    console.error("Exception in send-return-update:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
