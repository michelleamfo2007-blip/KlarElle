import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Globe, Smartphone, ChevronDown, Wrench, Camera, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

function Layout() {
  const { t, i18n } = useTranslation();
  const { cartCount } = useCart();
  const { session } = useAuth();
  const { currency, setCurrency, EXCHANGE_RATES, formatPrice } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image too large. Maximum size is 5MB.");
      return;
    }

    try {
      setAnalyzingImage(true);
      showToast("Analyzing image...");

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Data = reader.result;
        
        try {
          // Adjust this URL to point to your backend/Vercel endpoint
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${apiUrl}/api/analyze-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Data,
              mimeType: file.type
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to analyze image');
          }

          const data = await response.json();
          if (data.keywords) {
            navigate(`/search?q=${encodeURIComponent(data.keywords)}`);
          }
        } catch (error) {
          console.error(error);
          showToast("Couldn't analyze image. Please try again.");
        } finally {
          setAnalyzingImage(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
    } catch (error) {
      console.error(error);
      setAnalyzingImage(false);
      showToast("An error occurred.");
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('maintenance_mode').eq('id', 1).single();
        if (data && data.maintenance_mode) {
          setMaintenanceMode(true);
        }
      } catch (err) {
        console.error('Error fetching maintenance status:', err);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    fetchSettings();
  }, [location.pathname]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: newsletterEmail }]);
        
      if (error) {
        if (error.code === '23505') { // Unique violation
          showToast("You're already subscribed!");
        } else {
          showToast("Failed to subscribe. Please try again.");
          console.error(error);
        }
      } else {
        showToast("Thanks for subscribing to KLARELLE style news!");
        setNewsletterEmail('');
      }
    } catch (err) {
      showToast("An error occurred.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast("You have been successfully logged out.");
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (checkingMaintenance) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  if (maintenanceMode) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fafafa', textAlign: 'center', padding: '20px' }}>
        <Wrench size={48} color="#000" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '16px' }}>We'll be back shortly</h1>
        <p style={{ color: '#666', maxWidth: '400px', lineHeight: '1.6' }}>KlarElle is currently undergoing scheduled maintenance to improve your shopping experience. Please check back soon.</p>
      </div>
    );
  }

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
      
      <div className="top-bar" style={{ background: '#f5f5f5', padding: '8px 0', fontSize: '12px', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px' }} onClick={() => { setShowLangMenu(!showLangMenu); setShowCurrMenu(false); }}>
                <Globe size={12} /> {i18n.language?.toUpperCase() || 'EN'} <ChevronDown size={10} />
              </span>
              {showLangMenu && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40}} onClick={() => setShowLangMenu(false)} />}
              {showLangMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#fff', border: '1px solid #eee', padding: '8px 0', zIndex: 50, minWidth: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {['EN - English', 'FR - Français', 'ES - Español', 'DE - Deutsch', 'IT - Italiano', 'PT - Português', 'RU - Русский', 'ZH - 中文', 'JA - 日本語', 'AR - العربية', 'HI - हिन्दी', 'KO - 한국어', 'TR - Türkçe', 'NL - Nederlands'].map(lang => (
                    <div 
                      key={lang} 
                      className="dropdown-item" 
                      onClick={() => { i18n.changeLanguage(lang.split(' ')[0]); setShowLangMenu(false); }}
                      style={{ padding: '8px 16px', color: i18n.language === lang.split(' ')[0] ? '#000' : '#666', fontSize: '12px', fontWeight: i18n.language === lang.split(' ')[0] ? 'bold' : 'normal', textAlign: 'left', whiteSpace: 'nowrap' }}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px' }} onClick={() => { setShowCurrMenu(!showCurrMenu); setShowLangMenu(false); }}>
                {currency} <ChevronDown size={10} />
              </span>
              {showCurrMenu && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40}} onClick={() => setShowCurrMenu(false)} />}
              {showCurrMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#fff', border: '1px solid #eee', padding: '8px 0', zIndex: 50, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {Object.entries(EXCHANGE_RATES).map(([code, data]) => (
                    <div 
                      key={code} 
                      className="dropdown-item" 
                      onClick={() => { setCurrency(code); setShowCurrMenu(false); }}
                      style={{ padding: '8px 16px', color: currency === code ? '#000' : '#666', fontSize: '12px', fontWeight: currency === code ? 'bold' : 'normal', textAlign: 'left' }}
                    >
                      {code} - {data.symbol}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ color: '#666' }}>
            {t('Free shipping on orders over')} {formatPrice(100)}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-main">
            <Link to="/" className="logo">KLARELLE</Link>
            
            <form className="search-bar" onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search dresses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={analyzingImage}
                style={{ paddingRight: '40px' }}
              />
              <Search className="search-icon" size={18} />
              
              <button 
                type="button" 
                className="camera-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzingImage}
                style={{
                  position: 'absolute',
                  right: '90px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: analyzingImage ? 'default' : 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Search by Image"
              >
                {analyzingImage ? <Loader2 size={18} className="spin" /> : <Camera size={18} />}
              </button>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              <button type="submit" className="search-btn" disabled={analyzingImage}>SEARCH</button>
            </form>
            
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
              .spin { animation: spin 1s linear infinite; }
              .camera-btn:hover { color: #000 !important; }
            `}</style>
            
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
            <div className="nav-dropdown">
              <Link to="/category/all" className={`nav-link ${isActive('/category/all')}`}>COLLECTIONS</Link>
              {categories.length > 0 && (
                <div className="dropdown-menu">
                  {categories.map((cat) => (
                    <Link key={cat.id} to={`/category/${cat.slug}`} className={`nav-link ${isActive(`/category/${cat.slug}`)}`}>
                      {cat.name}
                    </Link>
                  ))}
                  <Link to="/category/all" className={`nav-link ${isActive('/category/all')}`}>All Collections</Link>
                </div>
              )}
            </div>
            <Link to="/page/about-us" className={`nav-link ${isActive('/page/about-us')}`}>ABOUT</Link>
            <Link to="/page/faq" className={`nav-link ${isActive('/page/faq')}`}>FAQ</Link>
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
                <Link to="/page/influencer-collaboration">Influencer Collaboration</Link>
                <Link to="/page/social-responsibility">Social Responsibility</Link>
              </div>
            </div>
            <div className="footer-col">
              <h4>Help & Support</h4>
              <div className="footer-links">
                <Link to="/page/faq">FAQ</Link>
                <Link to="/page/shipping-info">Shipping Info</Link>
                <Link to="/page/returns">Returns</Link>
                <Link to="/page/how-to-order">How to Order</Link>
                <Link to="/track-order">Track Order</Link>
              </div>
            </div>
            <div className="footer-col">
              <h4>Customer Care</h4>
              <div className="footer-links">
                <a href="mailto:support@klarelle.store">Contact Us</a>
                <Link to="/page/payment-method">Payment Method</Link>
                <Link to="/page/rewards">Rewards</Link>
                <a href="mailto:support@klarelle.store">Support</a>
              </div>
            </div>
            <div className="footer-col">
              <div>
                <h4 style={{ marginBottom: '12px' }}>Follow Us</h4>
                <div style={{ display: 'flex', gap: '16px', color: '#666', alignItems: 'center' }}>
                  <a href="https://www.instagram.com/klarelle_?igsh=d2xiYmloaHhzbThr" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} title="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@klarelle.store?_r=1&_t=ZS-98qn2e8LpYe" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} title="TikTok">
                    <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/share/1ETeTXkNfh/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }} title="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <h4 style={{ marginTop: '24px' }}>Sign up for KLARELLE style news</h4>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="newsletter-input" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  disabled={subscribing}
                />
                <button type="submit" className="newsletter-btn" disabled={subscribing}>
                  {subscribing ? 'WAIT...' : 'SUBSCRIBE'}
                </button>
              </form>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
                Questions? Email us at <a href="mailto:support@klarelle.store" style={{color: '#000', textDecoration: 'underline'}}>support@klarelle.store</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #eaeaea' }}>
            <div style={{ color: '#999', fontSize: '12px' }}>
              &copy; {new Date().getFullYear()} KLARELLE. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
