import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    
    // Fetch Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (orderData) {
      setOrder(orderData);
      
      // Fetch Order Items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products (
            name,
            image_url
          )
        `)
        .eq('order_id', id);
        
      if (itemsData) setItems(itemsData);
    }
    
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: '40px' }}>Order not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Order #{order.id.split('-')[0]}</h1>
            <span style={{ 
              padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
              background: order.status === 'Delivered' ? '#dcfce7' : 
                          order.status === 'Processing' ? '#dbeafe' : 
                          order.status === 'Shipped' ? '#fef9c3' : 
                          order.status === 'Cancelled' ? '#f3f4f6' : 
                          order.status === 'Refunded' ? '#fce7f3' : '#fee2e2',
              color: order.status === 'Delivered' ? '#166534' : 
                     order.status === 'Processing' ? '#1e40af' : 
                     order.status === 'Shipped' ? '#854d0e' : 
                     order.status === 'Cancelled' ? '#4b5563' : 
                     order.status === 'Refunded' ? '#be185d' : '#991b1b',
            }}>
              {order.status}
            </span>
          </div>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="order-details-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Order Items */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} /> Order Items
            </div>
            <div style={{ padding: '20px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#f3f4f6' }}>
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>{item.product?.name || 'Unknown Product'}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        {item.size && <span>Size: {item.size} </span>}
                        {item.color && <span>Color: {item.color} </span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '500' }}>${parseFloat(item.price_at_time).toFixed(2)}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', paddingTop: '8px' }}>
                <span>Total</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Logistics */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} /> Shipping & Fulfillment
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Selected Shipping Service</div>
                  <div style={{ fontWeight: '500' }}>{order.shipping_provider || 'Not selected'} {order.shipping_service ? `- ${order.shipping_service}` : ''}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Tracking Number</div>
                  {order.tracking_number ? (
                    <div style={{ fontWeight: '500', color: '#16a34a' }}>{order.tracking_number}</div>
                  ) : (
                    <div style={{ color: '#9ca3af' }}>No tracking available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Customer Info */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
              Customer Details
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>{order.customer_name}</div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>{order.customer_email}</div>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} /> Shipping Address
            </div>
            <div style={{ padding: '20px', color: '#4b5563', lineHeight: '1.5' }}>
              {order.shipping_address ? (
                <>
                  {order.shipping_address.street}<br/>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br/>
                  {order.shipping_address.country}
                </>
              ) : (
                'No address provided.'
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
