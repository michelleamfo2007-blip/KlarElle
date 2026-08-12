import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Package, CheckCircle, Truck, Info } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError('');
    setOrder(null);

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !data) {
      setError('Order not found. Please check your Order ID.');
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#22c55e';
      case 'pending': default: return '#eab308';
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '60vh', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>Track Your Order</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        Enter your Order ID to see the current status of your delivery.
      </p>

      <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Enter Order ID (e.g., 550e8400-e29b-...)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
          style={{ flex: 1, padding: '16px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '16px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '16px 32px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loading ? 'Searching...' : <><Search size={20} /> Track</>}
        </button>
      </form>

      {error && (
        <div style={{ padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', textAlign: 'center', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {order && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Order Details</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>Order ID: {order.id}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                display: 'inline-block', padding: '6px 12px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', 
                backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) 
              }}>
                {order.status || 'Pending'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#666" /> Shipping Information
              </h3>
              <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#333' }}>
                {order.customer_name}<br/>
                {order.shipping_address ? (
                  order.shipping_address.split(',').map((line, i) => <span key={i}>{line}<br/></span>)
                ) : 'Address pending'}<br/>
                {order.phone_number || ''}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="#666" /> Order Summary
              </h3>
              <p style={{ fontSize: '15px', color: '#333', marginBottom: '8px' }}>
                Total Amount: <span style={{ fontWeight: 'bold' }}>₵{parseFloat(order.total_amount).toFixed(2)}</span>
              </p>
              <p style={{ fontSize: '15px', color: '#333' }}>
                Payment Method: Stripe Card
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', padding: '16px', background: '#eff6ff', borderRadius: '4px', display: 'flex', gap: '12px' }}>
            <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0, lineHeight: '1.5' }}>
              If you have any questions about your order, please contact our support team at support@klarellestyles.com.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
