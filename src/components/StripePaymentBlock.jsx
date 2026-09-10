import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripePaymentBlock({ clientSecret, amount, formattedAmount, onSuccess }) {
  const options = { clientSecret, appearance: { theme: 'stripe' } };
  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm amount={amount} formattedAmount={formattedAmount} onSuccess={onSuccess} />
    </Elements>
  );
}
