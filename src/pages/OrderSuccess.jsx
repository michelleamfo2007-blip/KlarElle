import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

function OrderSuccess() {
  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
      <CheckCircle size={64} color="#16a34a" style={{ margin: '0 auto 24px' }} />
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Order Placed Successfully!</h1>
      <p style={{ color: '#666', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px' }}>
        Thank you for your purchase. We have received your order and will begin processing it right away. You will receive an email confirmation shortly.
      </p>
      <Link to="/" style={{ display: 'inline-block', padding: '16px 32px', background: '#000', color: '#fff', textDecoration: 'none', fontWeight: 'bold', borderRadius: '4px' }}>
        CONTINUE SHOPPING
      </Link>
    </div>
  );
}

export default OrderSuccess;
