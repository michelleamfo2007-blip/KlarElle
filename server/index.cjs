const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents/smallest currency unit
      currency: 'usd', // Update to your preferred currency (e.g. 'ghs' if Stripe supports it, or standard 'usd')
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

app.post('/invite-staff', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  try {
    // Generate a secure invite link using the Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (error) {
      console.error("Error inviting user:", error);
      return res.status(400).send({ error: error.message });
    }

    res.send({ success: true, user: data.user });
  } catch (error) {
    console.error("Exception inviting user:", error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/join-waitlist', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).send({ error: "Email is required" });
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

    res.send({ success: true });
  } catch (error) {
    console.error("Exception sending waitlist email:", error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Node server listening on port ${PORT}`);
});
