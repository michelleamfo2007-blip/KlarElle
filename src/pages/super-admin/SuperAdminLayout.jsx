import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Users, Settings, LogOut, BarChart3, Menu, X } from 'lucide-react';
import '../admin/Admin.css';

function SuperAdminLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!session) {
        setAuthLoading(false);
        return;
      }

      // Check if user is in the staff table, Active, and has Super Admin role
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
      } else if (data.role !== 'Super Admin') {
        // Not a super admin, send to regular dashboard
        navigate('/admin');
      } else {
        setUserName(data.name || 'Super Admin');
        setIsAuthorized(true);
      }
      setAuthLoading(false);
    };

    checkSuperAdminStatus();
  }, [session, navigate]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (authLoading && !isAuthorized && session) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111827', color: '#fff' }}>Verifying Super Admin access...</div>;
  }
  
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/admin" replace />;
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
        <nav style={{ flexGrow: 1, padding: '20px 0', overflowY: 'auto' }}>
          <Link onClick={closeMobileMenu} to="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Orders
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/customers" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <Users size={18} /> Customers
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/payments" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Payments
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/shipping" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> Shipping & Delivery
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/discounts" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> Discounts & Promotions
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/website" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> Website Content
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/reviews" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Reviews
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/support" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Support
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/reports" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Reports & Analytics
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/notifications" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Notifications
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <Settings size={18} /> Settings
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/activity" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> Activity Logs
          </Link>
          <Link onClick={closeMobileMenu} to="/super-admin/staff" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#fff', textDecoration: 'none' }}>
            <ShieldAlert size={18} /> Manage Staff
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
        <Outlet context={{ userName }} />
      </main>
    </div>
  );
}

export default SuperAdminLayout;
