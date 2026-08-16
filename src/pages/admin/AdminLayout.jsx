import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Package, LogOut, Ticket, ShoppingBag, Tag, Menu, X, Users } from 'lucide-react';
import './Admin.css';

function AdminLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

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
        setUserName(data.name || 'Admin');
        setIsAuthorized(true);
      }
      setAuthLoading(false);
    };

    checkStaffStatus();
  }, [session, navigate]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (authLoading && !isAuthorized && session) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Verifying access...</div>;
  }
  
  if (!session) {
    return <Navigate to="/admin/login" replace />;
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
        <nav style={{ flexGrow: 1, padding: '20px 0', overflowY: 'auto' }}>
          <NavLink onClick={closeMobileMenu} to="/admin" end className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/products" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/orders" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <ShoppingBag size={20} /> Orders
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/customers" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Users size={20} /> Customers
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/payments" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> Payments
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/shipping" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> Shipping & Delivery
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/coupons" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Tag size={20} /> Discounts & Promotions
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/waitlist" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <Users size={20} /> Waitlist
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/reviews" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Reviews
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/support" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Support
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/reports" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> Reports
          </NavLink>
          <NavLink onClick={closeMobileMenu} to="/admin/notifications" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Notifications
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
        <Outlet context={{ userName }} />
      </main>
    </div>
  );
}

export default AdminLayout;
