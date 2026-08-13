import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCurrency } from '../context/CurrencyContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings, ScanLine, Ticket, Coins, Wallet, Gift, 
  CreditCard, Package, Truck, MessageSquare, Undo2, 
  HeadphonesIcon, CalendarCheck, ShieldCheck, ChevronRight, Heart
} from 'lucide-react';
import MobileTabBar from '../components/MobileTabBar';
import './Profile.css';

function CustomerProfile() {
  const { session, signOut } = useAuth();
  const { favorites } = useFavorites();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    fetchCoupons();
    fetchRecommended();
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').eq('customer_email', session.user.email);
    if (data) setOrders(data);
  };

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').eq('is_active', true);
    if (data) setCoupons(data);
  };

  const fetchRecommended = async () => {
    // Fetch 4 random products
    const { data } = await supabase.from('products').select('*').limit(4);
    if (data) {
      // Shuffle array slightly for randomness
      const shuffled = data.sort(() => 0.5 - Math.random());
      setRecommended(shuffled);
    }
  };

  const unpaidCount = orders.filter(o => o.status === 'Unpaid').length;
  const processingCount = orders.filter(o => o.status === 'Paid' || o.status === 'Processing').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const reviewCount = orders.filter(o => o.status === 'Delivered').length;
  const returnsCount = orders.filter(o => o.status === 'Returned' || o.status === 'Returns').length;
  
  const bestCoupon = coupons.length > 0 ? coupons.reduce((prev, current) => (prev.discount_percent > current.discount_percent) ? prev : current) : null;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const userEmail = session?.user?.email || 'Guest';
  const userInitial = userEmail !== 'Guest' ? userEmail[0].toUpperCase() : 'G';
  const userName = userEmail !== 'Guest' ? userEmail.split('@')[0] : 'Guest';

  return (
    <div className="profile-page-container">
      
      <div className="profile-layout">
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-header">
            <div className="profile-sidebar-avatar">{userInitial}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userName}</div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{userEmail}</div>
          </div>
          <div className="profile-sidebar-menu">
            <Link to="/profile" className="profile-sidebar-item"><Settings size={20} /> Account Overview</Link>
            <Link to="/track-order" className="profile-sidebar-item"><Package size={20} /> My Orders</Link>
            <Link to="/favorites" className="profile-sidebar-item"><Heart size={20} /> Wishlist ({favorites.length})</Link>
            <Link to="/profile/vouchers" className="profile-sidebar-item"><Ticket size={20} /> Vouchers & Offers</Link>
            <Link to="/profile/wallet" className="profile-sidebar-item"><Wallet size={20} /> Wallet & Gift Cards</Link>
            <div className="profile-sidebar-item" onClick={handleLogout} style={{ cursor: 'pointer', color: '#ff4444' }}>
               <ScanLine size={20} /> Logout
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="profile-content">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="profile-header-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                {userInitial}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  My Profile <ChevronRight size={12} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', color: '#333' }}>
              <ScanLine size={24} />
              <Settings size={24} onClick={handleLogout} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Assets Bar */}
          <div className="profile-assets-bar">
            <Link to="/profile/vouchers" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{coupons.length}</div>
              <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                Vouchers
              </div>
            </Link>
            <Link to="/profile/wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}><Wallet size={20} strokeWidth={1.5} /></div>
              <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                Wallet
              </div>
            </Link>
            <Link to="/profile/wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}><Gift size={20} strokeWidth={1.5} /></div>
              <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                Gift Card
              </div>
            </Link>
          </div>

          {/* Promo Banner */}
          {bestCoupon && (
            <div className="profile-promo-banner">
              <div style={{ color: '#ff4444', fontWeight: 'bold' }}>
                🎟️ {bestCoupon.discount_percent}% OFF coupon ({bestCoupon.code})
              </div>
              <button style={{ background: '#f5f5f5', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Use
              </button>
            </div>
          )}

          {/* My Orders */}
          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>My Orders</h3>
              <Link to="/profile/orders" style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}>View all <ChevronRight size={14} /></Link>
            </div>
            <div className="orders-grid">
              <Link to="/profile/orders?status=unpaid" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                <CreditCard size={24} strokeWidth={1.5} />
                {unpaidCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{unpaidCount}</div>}
                <span style={{ fontSize: '12px' }}>Unpaid</span>
              </Link>
              <Link to="/profile/orders?status=processing" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                <Package size={24} strokeWidth={1.5} />
                {processingCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{processingCount}</div>}
                <span style={{ fontSize: '12px' }}>Processing</span>
              </Link>
              <Link to="/profile/orders?status=shipped" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                <Truck size={24} strokeWidth={1.5} />
                {shippedCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{shippedCount}</div>}
                <span style={{ fontSize: '12px' }}>Shipped</span>
              </Link>
              <Link to="/profile/orders?status=delivered" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                <MessageSquare size={24} strokeWidth={1.5} />
                {reviewCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{reviewCount}</div>}
                <span style={{ fontSize: '12px' }}>Review</span>
              </Link>
              <Link to="/profile/orders?status=returned" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                <Undo2 size={24} strokeWidth={1.5} />
                {returnsCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{returnsCount}</div>}
                <span style={{ fontSize: '12px' }}>Returns</span>
              </Link>
            </div>
          </div>

          {/* Utilities */}
          <div className="utilities-grid">
            <Link to="/page/contact-us" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
              <HeadphonesIcon size={24} strokeWidth={1.5} />
              <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Customer<br/>Service</span>
            </Link>
            <Link to="/check-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
              <CalendarCheck size={24} strokeWidth={1.5} />
              <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Check In</span>
            </Link>
            <Link to="/page/returns" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
              <ShieldCheck size={24} strokeWidth={1.5} />
              <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Policy</span>
            </Link>
          </div>

          {/* Wishlist Preview */}
          <div className="profile-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Wishlist</h3>
            {favorites.length > 0 ? (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {favorites.map(item => (
                  <div key={item.id} style={{ minWidth: '100px', width: '100px' }}>
                    <img src={item.image_url || '/placeholder.png'} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '4px' }} alt={item.name} />
                    <div style={{ fontSize: '12px', color: '#ff4444', fontWeight: 'bold', marginTop: '4px' }}>{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#666', padding: '20px 0', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                You haven't saved any items yet.
              </div>
            )}
          </div>

          {/* For You Grid */}
          <div style={{ padding: '0 8px' }}>
            <div style={{ textAlign: 'center', padding: '16px 0', fontWeight: 'bold', color: '#333' }}>- RECOMMENDED FOR YOU -</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {recommended.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                  <img src={product.image_url || '/placeholder.png'} style={{ width: '100%', height: '220px', objectFit: 'cover' }} alt={product.name} />
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatPrice(product.price)}</div>
                    <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>{product.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      <MobileTabBar activeTab="me" />
    </div>
  );
}

export default CustomerProfile;
