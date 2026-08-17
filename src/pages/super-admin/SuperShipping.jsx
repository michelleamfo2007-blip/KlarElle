import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Truck, Printer, Search, MapPin, CheckCircle, Save } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

function SuperShipping() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Settings
  const [shippingThreshold, setShippingThreshold] = useState(100);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Settings
    const { data: settings } = await supabase.from('store_settings').select('shipping_threshold').eq('id', 1).single();
    if (settings) setShippingThreshold(settings.shipping_threshold);

    // Fetch Orders needing shipping or already shipped
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, created_at, customer_name, customer_email, total_amount, status, shipping_address, phone_number, shipping_provider, shipping_service, tracking_number, shipping_label_url, shippo_rate_id')
      .in('status', ['Paid', 'Processing', 'Shipped', 'Delivered'])
      .order('created_at', { ascending: false });
      
    if (ordersData) setOrders(ordersData);
    setLoading(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase.from('store_settings').update({ shipping_threshold: shippingThreshold }).eq('id', 1);
    setSavingSettings(false);
    if (error) alert('Failed to save settings.');
    else alert('Shipping threshold updated successfully.');
  };

  const generateLabel = async (order) => {
    try {
      // Optimistic UI loading state could be added here
      
      const res = await fetch('/api/create-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          name: order.customer_name,
          address: order.shipping_address,
          destinationZip: order.shipping_address ? order.shipping_address.split(',').pop().trim().split(' ').pop() : '10001',
          rateObjectId: order.shippo_rate_id
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update DB
        await supabase.from('orders').update({
          tracking_number: data.trackingNumber,
          shipping_label_url: data.labelUrl,
          status: 'Shipped'
        }).eq('id', order.id);
        
        alert('Label generated successfully! Tracking Number: ' + data.trackingNumber);
        fetchData();
      } else {
        alert('Failed to generate label: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error generating label: ' + err.message);
    }
  };
  
  const markAsDelivered = async (orderId) => {
    const { error } = await supabase.from('orders').update({ status: 'Delivered' }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o));
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Shipping & Fulfillment</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Manage order shipments, tracking, and labels.</p>
        </div>
      </div>

      {/* Shipping Settings */}
      <div className="flex-column-mobile" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px', gap: '24px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Free Shipping Threshold</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Orders over this amount will qualify for free standard shipping.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 'bold' }}>$</span>
            <input 
              type="number" 
              value={shippingThreshold}
              onChange={e => setShippingThreshold(e.target.value)}
              style={{ padding: '8px 12px 8px 24px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '120px' }}
            />
          </div>
          <button onClick={saveSettings} disabled={savingSettings} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex-column-mobile" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px', width: '100%' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Needs Processing (Paid)</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-responsive-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Order Details</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Shipping Destination</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Service Selected</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Status & Tracking</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading queue...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No orders found in queue.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>#{order.id.split('-')[0]}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                    <div style={{ fontWeight: '600', color: '#000', marginTop: '8px' }}>{formatPrice(order.total_amount)}</div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} color="#6b7280" /> {order.customer_name}</div>
                    <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4', maxWidth: '250px' }}>{order.shipping_address || 'No address provided'}</div>
                    {order.phone_number && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{order.phone_number}</div>}
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Package size={16} color="#6b7280"/> {order.shipping_provider || 'Standard'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{order.shipping_service || 'Shipping'}</div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', marginBottom: '8px',
                      background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#fef9c3' : '#dbeafe',
                      color: order.status === 'Delivered' ? '#166534' : order.status === 'Shipped' ? '#854d0e' : '#1e40af'
                    }}>
                      {order.status}
                    </span>
                    {order.tracking_number ? (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Truck size={14} /> {order.tracking_number}
                        </div>
                        {order.shipping_label_url && (
                          <a href={order.shipping_label_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Printer size={12} /> View Label
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>No tracking available</div>
                    )}
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      {!order.tracking_number && (order.status === 'Paid' || order.status === 'Processing') && (
                        <button onClick={() => generateLabel(order)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          <Printer size={14} /> Print Label & Ship
                        </button>
                      )}
                      {order.status === 'Shipped' && (
                        <button onClick={() => markAsDelivered(order.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                      )}
                    </div>
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

export default SuperShipping;
