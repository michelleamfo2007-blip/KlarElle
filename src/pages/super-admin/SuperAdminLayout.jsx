import React, { useState } from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, Settings, LogOut, BarChart3, Menu, X } from 'lucide-react';
import '../admin/Admin.css';

function SuperAdminLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      <div 
        className={`admin-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid rgba(250, 249, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={24} color="#BCA38F" />
            <span>Super Admin</span>
          </div>
          {isMobileMenuOpen && (
            <button onClick={closeMobileMenu} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>
        <nav style={{ flexGrow: 1, padding: '20px 0' }}>
          <Link onClick={closeMobileMenu} to="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <BarChart3 size={20} /> Overview
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/staff" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
            <Users size={20} /> Manage Staff
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', color: '#fff', textDecoration: 'none' }}>
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
      <main className="admin-main">
        {/* Mobile Header Toggle */}
        <div className="mobile-menu-btn-container" style={{ display: 'flex', marginBottom: '20px' }}>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default SuperAdminLayout;
