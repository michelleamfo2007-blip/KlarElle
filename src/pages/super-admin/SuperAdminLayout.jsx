import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, Settings, LogOut, BarChart3 } from 'lucide-react';

function SuperAdminLayout() {
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
        <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid rgba(250, 249, 246, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={24} color="#BCA38F" />
          <span>Super Admin</span>
        </div>
        <nav style={{ flexGrow: 1, padding: '20px 0' }}>
          <Link to="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <BarChart3 size={20} /> Overview
          </Link>
          <Link to="/super-admin/staff" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <Users size={20} /> Manage Staff
          </Link>
          <Link to="/super-admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <Settings size={20} /> Global Settings
          </Link>
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

export default SuperAdminLayout;
