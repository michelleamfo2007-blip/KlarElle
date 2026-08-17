import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from 'lucide-react';

export default function CheckoutForm({ amount, formattedAmount, onSuccess, onFail }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order-success',
      },
      redirect: 'if_required', // We don't want a full page redirect if we can avoid it
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
      if (onFail) onFail(error);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      if (onSuccess) {
        await onSuccess();
      }
      // Do not set isLoading to false here, so the spinner remains while the page redirects
    } else {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      {message && <div id="payment-message" style={{ color: '#dc2626', marginTop: '16px', fontSize: '14px' }}>{message}</div>}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        style={{
          width: '100%', padding: '16px', background: '#000', color: '#fff', 
          border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', 
          cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px'
        }}
      >
        {isLoading ? <Loader2 size={20} className="spin" /> : <Lock size={18} />}
        PAY {formattedAmount || `₵${parseFloat(amount).toFixed(2)}`}
      </button>
      
      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '16px' }}>
        Payments are secure and encrypted.
      </p>
    </form>
  );
}
