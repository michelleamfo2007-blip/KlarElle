import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Globe, Smartphone, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function Layout() {
  const { cartCount } = useCart();
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [selectedCurr, setSelectedCurr] = useState('USD');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast("You have been successfully logged out.");
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-wrapper">
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#111',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: '500',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          border: '1px solid #333'
        }}>
          {toastMessage}
        </div>
      )}
      
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-left" style={{ display: 'flex', gap: '20px' }}>
            <div 
              className="top-bar-item" 
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrMenu(false); }}>
                <Globe size={14} /> {selectedLang} <ChevronDown size={12} />
              </span>
              {showLangMenu && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40}} onClick={() => setShowLangMenu(false)} />}
              {showLangMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #eee', padding: '8px 0', zIndex: 50, minWidth: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {['EN - English', 'FR - Français', 'ES - Español', 'DE - Deutsch', 'IT - Italiano', 'PT - Português', 'RU - Русский', 'ZH - 中文', 'JA - 日本語', 'AR - العربية', 'HI - हिन्दी'].map(lang => (
                    <div 
                      key={lang} 
                      className="dropdown-item" 
                      onClick={() => { setSelectedLang(lang.split(' ')[0]); setShowLangMenu(false); }}
                      style={{ padding: '8px 16px', color: selectedLang === lang.split(' ')[0] ? '#000' : '#666', fontSize: '12px', fontWeight: selectedLang === lang.split(' ')[0] ? 'bold' : 'normal' }}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div 
              className="top-bar-item" 
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => { setShowCurrMenu(!showCurrMenu); setShowLangMenu(false); }}>
                {selectedCurr} <ChevronDown size={12} />
              </span>
              {showCurrMenu && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40}} onClick={() => setShowCurrMenu(false)} />}
              {showCurrMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #eee', padding: '8px 0', zIndex: 50, minWidth: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {['USD - $', 'EUR - €', 'GBP - £', 'GHS - ₵', 'CAD - $', 'AUD - $', 'JPY - ¥', 'CNY - ¥', 'CHF - CHF', 'ZAR - R'].map(curr => (
                    <div 
                      key={curr} 
                      className="dropdown-item" 
                      onClick={() => { setSelectedCurr(curr.split(' ')[0]); setShowCurrMenu(false); }}
                      style={{ padding: '8px 16px', color: selectedCurr === curr.split(' ')[0] ? '#000' : '#666', fontSize: '12px', fontWeight: selectedCurr === curr.split(' ')[0] ? 'bold' : 'normal' }}
                    >
                      {curr}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="top-bar-right">
            <span className="top-bar-item">Support</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-main">
            <Link to="/" className="logo">KLARELLE</Link>
            
            <div className="search-bar">
              <input type="text" className="search-input" placeholder="Search dresses, tops, shoes..." />
              <Search className="search-icon" size={18} />
              <button className="search-btn">SEARCH</button>
            </div>
            
            <div className="header-actions">
              {session?.user ? (
                <Link to="/profile" className="action-icon" style={{color: 'inherit', textDecoration: 'none'}}>
                  <User size={24} strokeWidth={1.5} />
                  <span>Profile</span>
                </Link>
              ) : (
                <Link to="/login" className="action-icon" style={{color: 'inherit', textDecoration: 'none'}}>
                  <User size={24} strokeWidth={1.5} />
                  <span>Sign In</span>
                </Link>
              )}
              <Link to="/favorites" className="action-icon" style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>
                <Heart size={24} strokeWidth={1.5} />
                <span>Favorites</span>
              </Link>
              <Link to="/cart" className="action-icon" style={{color: 'inherit'}}>
                <ShoppingBag size={24} strokeWidth={1.5} />
                <span>Cart</span>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
            </div>
          </div>
          
          <nav className="nav-menu">
            <Link to="/" className={`nav-link ${isActive('/')}`}>HOME</Link>
            <Link to="/category/new-in" className={`nav-link ${isActive('/category/new-in')}`}>NEW IN</Link>
            <Link to="/category/flash-sale" className={`nav-link sale ${isActive('/category/flash-sale')}`}>FLASH SALE</Link>
            <Link to="/category/maxi-dresses" className={`nav-link ${isActive('/category/maxi-dresses')}`}>MAXI DRESSES</Link>
            <Link to="/category/midi-dresses" className={`nav-link ${isActive('/category/midi-dresses')}`}>MIDI DRESSES</Link>
            <Link to="/category/mini-dresses" className={`nav-link ${isActive('/category/mini-dresses')}`}>MINI DRESSES</Link>
            <Link to="/category/bodycon" className={`nav-link ${isActive('/category/bodycon')}`}>BODYCON</Link>
            <Link to="/category/party-wear" className={`nav-link ${isActive('/category/party-wear')}`}>PARTY WEAR</Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-col">
              <h4>Company Info</h4>
              <div className="footer-links">
                <Link to="/page/about-us">About Us</Link>
                <Link to="/page/fashion-blogger">Fashion Blogger</Link>
                <Link to="/page/social-responsibility">Social Responsibility</Link>
                <Link to="/page/careers">Careers</Link>
              </div>
            </div>
            <div className="footer-col">
              <h4>Help & Support</h4>
              <div className="footer-links">
                <Link to="/page/shipping-info">Shipping Info</Link>
                <Link to="/page/returns">Returns</Link>
                <Link to="/page/how-to-order">How to Order</Link>
                <Link to="/track-order">Track Order</Link>
              </div>
            </div>
            <div className="footer-col">
              <h4>Customer Care</h4>
              <div className="footer-links">
                <Link to="/page/contact-us">Contact Us</Link>
                <Link to="/page/payment-method">Payment Method</Link>
                <Link to="/page/bonus-point">Bonus Point</Link>
              </div>
            </div>
            <div className="footer-col">
              <h4>Sign up for KLARELLE style news</h4>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your Email Address" className="newsletter-input" />
                <button type="submit" className="newsletter-btn">SUBSCRIBE</button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} KLARELLE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
