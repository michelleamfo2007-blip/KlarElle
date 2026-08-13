import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { ChevronLeft, Package, Clock, CheckCircle, Truck, RefreshCcw } from 'lucide-react';

function MyOrders() {
  const { session } = useAuth();
  const { formatPrice } = useCurrency();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Parse initial status from URL
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get('status') || 'all';
  const [activeTab, setActiveTab] = useState(initialStatus);

  useEffect(() => {
    if (session?.user?.email) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', session.user.email)
        .order('created_at', { ascending: false });
        
      if (data) setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unpaid', label: 'Unpaid' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Review' },
    { id: 'returned', label: 'Returns' }
  ];

  // Map internal statuses to tab IDs
  const getTabForStatus = (status) => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'processing') return 'processing';
    if (s === 'returns' || s === 'returned') return 'returned';
    return s;
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => getTabForStatus(order.status) === activeTab);

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return '#00aa00';
    if (s === 'shipped') return '#0066cc';
    if (s === 'unpaid') return '#ff9900';
    if (s === 'returned' || s === 'returns') return '#ff4444';
    return '#333';
  };

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return <CheckCircle size={16} />;
    if (s === 'shipped') return <Truck size={16} />;
    if (s === 'processing' || s === 'paid') return <Clock size={16} />;
    if (s === 'returned' || s === 'returns') return <RefreshCcw size={16} />;
    return <Package size={16} />;
  };

  if (!session) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Please log in to view your orders.</h3>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh' }}>
        
        {/* Header */}
        <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <Link to="/profile" style={{ color: 'inherit' }}>
            <ChevronLeft size={24} style={{ cursor: 'pointer' }} />
          </Link>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>My Orders</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#fff', 
          overflowX: 'auto', 
          borderBottom: '1px solid #eee',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}>
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                color: activeTab === tab.id ? '#000' : '#666',
                borderBottom: activeTab === tab.id ? '2px solid #000' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', background: '#fff', borderRadius: '12px' }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>You don't have any {activeTab !== 'all' ? activeTab : ''} orders yet.</p>
              <Link to="/" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '24px', fontWeight: 'bold' }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredOrders.map((order) => (
                <div key={order.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  
                  {/* Order Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      color: getStatusColor(order.status)
                    }}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  {/* Order Details Preview */}
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {formatPrice(order.total_amount)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Link to="/track-order" style={{ 
                      padding: '8px 16px', 
                      border: '1px solid #ddd', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      color: '#000',
                      textDecoration: 'none'
                    }}>
                      Track Order
                    </Link>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default MyOrders;
