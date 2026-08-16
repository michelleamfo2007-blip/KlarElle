import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOutletContext, Link } from 'react-router-dom';
import '../admin/Admin.css';

function SuperDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 1, // Currently only 1 tenant is supported natively
    platformRevenue: 0,
    totalOrders: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { userName } = useOutletContext();

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    
    // Fetch all orders
    const { data: orders } = await supabase.from('orders').select('total_amount, customer_name, status');
    
    if (orders) {
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      
      // Calculate unique customers
      const uniqueCustomers = new Set(orders.map(o => o.customer_name)).size;
      
      // Order statuses
      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      const processingOrders = orders.filter(o => o.status === 'Processing').length;
      const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
      const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
      const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
      const refundedOrders = orders.filter(o => o.status === 'Refunded').length;
      
      setStats({
        platformRevenue: revenue,
        totalOrders: orders.length,
        activeUsers: uniqueCustomers,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        refundedOrders
      });
    }
    
    setLoading(false);
  };

  const formatUSD = (amount) => `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Welcome back, {userName}!</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Super Admin control center for KlarElle.</p>
        </div>
      </div>
      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Sales</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : formatUSD(stats.platformRevenue)}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.totalOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Customers</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.activeUsers}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.pendingOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Processing Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.processingOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Shipped Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.shippedOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Delivered Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.deliveredOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ color: '#BCA38F', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Cancelled Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.cancelledOrders}</div>
        </div>
      </div>

    </div>
  );
}

export default SuperDashboard;
