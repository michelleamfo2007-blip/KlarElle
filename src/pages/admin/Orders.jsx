import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Search } from 'lucide-react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    if (error) {
      alert('Failed to update order status');
      fetchOrders();
    }
  };

  const generateShippingLabel = async (order) => {
    try {
      const res = await fetch('/api/create-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id,
          name: order.customer_name,
          destinationZip: '10001' 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Shipping Label generated successfully!\nTracking Number: ${data.trackingNumber}`);
        updateOrderStatus(order.id, 'Shipped');
      } else {
        alert('Error generating label: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to Shippo API');
    }
  };

  const formatUSD = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;

  const filteredOrders = orders.filter(o => 
    (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Orders</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Manage and track all customer orders.</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '250px' }}
          />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #D2C4B3' }}>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Order ID & Date</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Customer</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Amount</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Shipping</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#BCA38F' }}>Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#111827' }}>No orders found.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #FAF9F6', color: '#111827' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600' }}>{order.id.split('-')[0]}...</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '500' }}>
                    {formatUSD(order.total_amount)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: '1px solid #d1d5db',
                        background: order.status === 'Delivered' ? '#dcfce7' : 
                                    order.status === 'Processing' ? '#dbeafe' : 
                                    order.status === 'Shipped' ? '#fef9c3' : '#fee2e2',
                        color: order.status === 'Delivered' ? '#166534' : 
                               order.status === 'Processing' ? '#1e40af' : 
                               order.status === 'Shipped' ? '#854d0e' : '#991b1b',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button 
                      onClick={() => generateShippingLabel(order)}
                      style={{ padding: '6px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Print Label
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
