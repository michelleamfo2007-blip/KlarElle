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
    const { data: orders } = await supabase.from('orders').select('total_amount, customer_name');
    
    if (orders) {
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      
      // Calculate unique customers
      const uniqueCustomers = new Set(orders.map(o => o.customer_name)).size;
      
      // 1. Fetch Staff Count
      const savedStaff = localStorage.getItem('klarelle_staff');
      let staffCount = 1;
      if (savedStaff) {
        staffCount = JSON.parse(savedStaff).length;
      }
      
      setStats({
        totalStaff: staffCount,
        platformRevenue: revenue,
        totalOrders: orders.length,
        activeUsers: uniqueCustomers
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
      <div className="kpi-grid">
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Staff</div>
            <div style={{ background: 'rgba(188, 163, 143, 0.1)', padding: '8px', borderRadius: '8px', color: '#BCA38F' }}><Users size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.totalStaff}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform Revenue</div>
            <div style={{ background: 'rgba(188, 163, 143, 0.1)', padding: '8px', borderRadius: '8px', color: '#BCA38F' }}><DollarSign size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : formatUSD(stats.platformRevenue)}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
            <div style={{ background: 'rgba(17, 24, 39, 0.05)', padding: '8px', borderRadius: '8px', color: '#111827' }}><ShoppingCart size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.totalOrders}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Users (Est)</div>
            <div style={{ background: 'rgba(188, 163, 143, 0.1)', padding: '8px', borderRadius: '8px', color: '#BCA38F' }}><Activity size={20} /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : stats.activeUsers}</div>
        </div>
      </div>

    </div>
  );
}

export default SuperDashboard;
