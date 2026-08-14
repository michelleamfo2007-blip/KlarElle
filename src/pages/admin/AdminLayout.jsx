import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, LogOut, Ticket, ShoppingBag, Tag, Menu, X } from 'lucide-react';
import './Admin.css';

function AdminLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!session) {
        setAuthLoading(false);
        return;
      }

      // Check if user is in the staff table and Active
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .ilike('email', session.user.email)
        .eq('status', 'Active')
        .single();

      if (error || !data) {
        // User not found, not active, or deleted
        await supabase.auth.signOut();
        navigate('/admin/login');
      } else {
        setUserRole(data.role);
        setIsAuthorized(true);
      }
      setAuthLoading(false);
    };

    checkStaffStatus();
  }, [session, navigate]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!session || (authLoading && !isAuthorized)) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Verifying access...</div>;
  }
  
  if (!isAuthorized) {
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
        <div style={{ padding: '24px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid rgba(250, 249, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>KlarElle Admin</span>
          {isMobileMenuOpen && (
            <button onClick={closeMobileMenu} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>
        <nav style={{ flexGrow: 1, padding: '20px 0' }}>
          <NavLink onClick={closeMobileMenu} to="/admin" end className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/products" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/orders" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <ShoppingBag size={20} /> Orders
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/coupons" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Tag size={20} /> Coupons
          </NavLink>
          
          {userRole === 'Super Admin' && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(250, 249, 246, 0.1)' }}>
              <NavLink onClick={closeMobileMenu} to="/super-admin" className="admin-nav-item" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                <Ticket size={20} /> Super Admin Panel
              </NavLink>
            </div>
          )}
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

export default AdminLayout;
