import React from 'react';
import { Outlet, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, LogOut, Ticket, ShoppingBag, Tag } from 'lucide-react';
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF9F6' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#111827', color: '#FAF9F6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid rgba(250, 249, 246, 0.1)' }}>
          KlarElle Admin
        </div>
        <nav style={{ flexGrow: 1, padding: '20px 0' }}>
          <NavLink to="/admin" end className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <ShoppingBag size={20} /> Orders
          </NavLink>
          <NavLink to="/admin/coupons" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Tag size={20} /> Coupons
          </NavLink>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid rgba(250, 249, 246, 0.1)' }}>
          <button onClick={handleLogout} className="admin-nav-item logout-btn">
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
