import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function SuperDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 1, // Currently only 1 tenant is supported natively
    platformRevenue: 0,
    totalOrders: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    
    // Fetch all orders
    const { data: orders } = await supabase.from('orders').select('total_amount, customer_name');
    
    if (orders) {
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      
      // Calculate unique customers
      const uniqueCustomers = new Set(orders.map(o => o.customer_name)).size;
      
      setStats({
        totalTenants: 1, // Only 1 tenant currently active in DB
        platformRevenue: revenue,
        totalOrders: orders.length,
        activeUsers: uniqueCustomers
      });
    }
    
    setLoading(false);
  };

  const formatGHS = (amount) => `₵${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Platform Overview</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Monitor all tenants and platform-wide metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Active Tenants</div>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px', color: '#4b5563' }}><Users size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{loading ? '...' : stats.totalTenants}</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Platform Revenue</div>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}><DollarSign size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{loading ? '...' : formatGHS(stats.platformRevenue)}</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Global Orders</div>
            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}><ShoppingCart size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{loading ? '...' : stats.totalOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Active Customers</div>
            <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '8px', color: '#dc2626' }}><Activity size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{loading ? '...' : stats.activeUsers}</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Recent Tenant Activity</h3>
        <p style={{ color: '#6b7280' }}>Platform activity charts and tables will go here once more tenants join.</p>
      </div>
    </div>
  );
}

export default SuperDashboard;
