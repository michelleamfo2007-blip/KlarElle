import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, LogOut, Ticket } from 'lucide-react';
import './Admin.css';

function AdminLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
          Tenant Admin
        </div>
        <nav style={{ flexGrow: 1, padding: '20px 0' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <Package size={20} /> Products
          </Link>
          <Link to="/admin/coupons" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <Ticket size={20} /> Coupons
          </Link>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #333' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
