const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Node server listening on port ${PORT}`);
});
