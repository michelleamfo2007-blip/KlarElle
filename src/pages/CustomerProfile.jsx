import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings, Ticket, Wallet, Gift,
  CreditCard, Package, Truck, MessageSquare, Undo2,
  HeadphonesIcon, ShieldCheck, ChevronRight, Heart
} from 'lucide-react';
import MobileTabBar from '../components/MobileTabBar';
import { isComingSoon, isPublishedOnStorefront } from '../utils/storefront';
import { productPath } from '../utils/productUrl';
import './Profile.css';

function accountName(user) {
  const meta = user?.user_metadata || {};
  return String(meta.full_name || meta.name || '').trim();
}

function statusBucket(status) {
  const value = String(status || '').toLowerCase();
  if (['unpaid', 'pending'].includes(value)) return 'unpaid';
  if (['paid', 'processing'].includes(value)) return 'processing';
  if (value === 'shipped') return 'shipped';
  if (value === 'delivered') return 'delivered';
  if (['returned', 'returns'].includes(value)) return 'returned';
  return value;
}

function CustomerProfile() {
  const { session, signOut } = useAuth();
  const { favorites } = useFavorites();
  const { formatPrice } = useCurrency();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [editingAccount, setEditingAccount] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');

  useEffect(() => {
    if (!session?.user) {
      navigate('/login');
      return;
    }
    const meta = session.user.user_metadata || {};
    setFullName(accountName(session.user));
    setPhone(meta.phone || '');
    fetchOrders(session.user.email);
    fetchWallet(session.user.email);
    fetchCoupons();
  }, [session, navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [favorites]);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchOrders = async (email) => {
    if (!email) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchWallet = async (email) => {
    if (!email) return;
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_email', email)
      .maybeSingle();
    setWalletBalance(data ? Number(data.balance) || 0 : 0);
  };

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('discount_percent', { ascending: false });
    if (data) setCoupons(data);
  };

  const fetchWishlist = async () => {
    const ids = (favorites || []).filter(Boolean);
    if (!ids.length) {
      setWishlist([]);
      return;
    }
    const { data } = await supabase.from('products').select('*').in('id', ids);
    setWishlist((data || []).filter((item) => isPublishedOnStorefront(item)));
  };

  const fetchRecommended = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('visibility', true)
      .eq('status', 'active')
      .limit(24);
    const published = (data || []).filter((item) => isPublishedOnStorefront(item) && !isComingSoon(item));
    setRecommended(published.slice(0, 4));
  };

  const processingCount = orders.filter((order) => statusBucket(order.status) === 'processing').length;
  const shippedCount = orders.filter((order) => statusBucket(order.status) === 'shipped').length;
  const reviewCount = orders.filter((order) => statusBucket(order.status) === 'delivered').length;
  const returnsCount = orders.filter((order) => statusBucket(order.status) === 'returned').length;

  const bestCoupon = coupons[0] || null;
  const user = session?.user;
  const userEmail = user?.email || '';
  const savedName = accountName(user);
  const userName = savedName || 'My account';
  const userInitial = (savedName || userEmail || 'K').charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    navigate('/login');
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    setSavingAccount(true);
    setAccountMessage('');
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim()
      }
    });
    setSavingAccount(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    setAccountMessage('Saved');
    setEditingAccount(false);
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-sidebar-header">
            <div className="profile-sidebar-avatar">{userInitial}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{userName}</div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{userEmail}</div>
          </div>
          <div className="profile-sidebar-menu">
            <Link to="/profile" className="profile-sidebar-item"><Settings size={20} /> Account Overview</Link>
            <Link to="/profile/orders" className="profile-sidebar-item"><Package size={20} /> My Orders</Link>
            <Link to="/favorites" className="profile-sidebar-item"><Heart size={20} /> Wishlist ({wishlist.length})</Link>
            <Link to="/profile/vouchers" className="profile-sidebar-item"><Ticket size={20} /> Vouchers & Offers</Link>
            <Link to="/profile/wallet" className="profile-sidebar-item"><Wallet size={20} /> Wallet & Gift Cards</Link>
            <div className="profile-sidebar-item" onClick={handleLogout} style={{ cursor: 'pointer', color: '#ff4444' }}>
              Logout
            </div>
          </div>
        </aside>

        <div className="profile-content">
          <div className="profile-header-card">
            <div className="profile-header-user">
              <div className="profile-header-avatar">{userInitial}</div>
              <button
                type="button"
                className="profile-header-text"
                onClick={() => setEditingAccount((open) => !open)}
              >
                <div className="profile-header-name">{userName}</div>
                <div className="profile-header-email">
                  <span>{userEmail}</span> <ChevronRight size={12} />
                </div>
              </button>
            </div>
            <button
              type="button"
              className="profile-header-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {editingAccount && (
            <form className="profile-card" onSubmit={saveAccount}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Account details</h3>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '12px', boxSizing: 'border-box' }}
              />
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '12px', boxSizing: 'border-box' }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Email: {userEmail}</div>
              {accountMessage && <div style={{ fontSize: '13px', marginBottom: '12px' }}>{accountMessage}</div>}
              <button
                type="submit"
                disabled={savingAccount}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {savingAccount ? 'Saving...' : 'Save details'}
              </button>
            </form>
          )}

          <div className="profile-assets-bar">
            <Link to="/profile/vouchers" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{coupons.length}</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Vouchers</div>
            </Link>
            <Link to="/profile/wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{walletBalance == null ? '—' : formatPrice(walletBalance)}</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Wallet</div>
            </Link>
            <Link to="/profile/wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}><Gift size={20} strokeWidth={1.5} /></div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Gift Card</div>
            </Link>
          </div>

          {bestCoupon && (
            <div className="profile-promo-banner">
              <div style={{ color: '#ff4444', fontWeight: 'bold' }}>
                {bestCoupon.discount_percent}% off{bestCoupon.code ? ` · ${bestCoupon.code}` : ''}
                {bestCoupon.description ? ` · ${bestCoupon.description}` : ''}
              </div>
              <Link to="/" style={{ background: '#f5f5f5', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', color: '#000' }}>
                Shop
              </Link>
            </div>
          )}

          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>My Orders</h3>
              <Link to="/profile/orders" style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>View all <ChevronRight size={14} /></Link>
            </div>
            <div className="orders-grid">
              <Link to="/cart">
                <CreditCard size={24} strokeWidth={1.5} />
                {cartCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '4px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{cartCount}</div>}
                <span>Unpaid</span>
              </Link>
              <Link to="/profile/orders?status=processing">
                <Package size={24} strokeWidth={1.5} />
                {processingCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '4px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{processingCount}</div>}
                <span>Processing</span>
              </Link>
              <Link to="/profile/orders?status=shipped">
                <Truck size={24} strokeWidth={1.5} />
                {shippedCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '4px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{shippedCount}</div>}
                <span>Shipped</span>
              </Link>
              <Link to="/profile/orders?status=delivered">
                <MessageSquare size={24} strokeWidth={1.5} />
                {reviewCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '4px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{reviewCount}</div>}
                <span>Review</span>
              </Link>
              <Link to="/profile/orders?status=returned">
                <Undo2 size={24} strokeWidth={1.5} />
                {returnsCount > 0 && <div style={{ position: 'absolute', top: '-4px', right: '4px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>{returnsCount}</div>}
                <span>Returns</span>
              </Link>
            </div>
          </div>

          <div className="utilities-grid">
            <Link to="/page/contact-us">
              <HeadphonesIcon size={24} strokeWidth={1.5} />
              <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Customer<br/>Service</span>
            </Link>
            <Link to="/page/returns">
              <ShieldCheck size={24} strokeWidth={1.5} />
              <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Policy</span>
            </Link>
          </div>

          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Wishlist</h3>
              <Link to="/favorites" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>View all</Link>
            </div>
            {wishlist.length > 0 ? (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {wishlist.map((item) => (
                  <Link key={item.id} to={productPath(item)} style={{ minWidth: '100px', width: '100px', textDecoration: 'none', color: 'inherit' }}>
                    <img src={item.image_url || '/placeholder.png'} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '4px' }} alt={item.name} />
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{formatPrice(item.price)}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#666', padding: '20px 0', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                You haven't saved any items yet.
              </div>
            )}
          </div>

          <div className="profile-card" style={{ display: 'block' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{ width: '100%', padding: '14px', background: '#fff', color: '#ff4444', border: '1px solid #eee', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              Log out
            </button>
          </div>

          {recommended.length > 0 && (
            <div style={{ padding: '0 8px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0', fontWeight: 'bold', color: '#333' }}>- RECOMMENDED FOR YOU -</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {recommended.map((product) => (
                  <Link to={productPath(product)} key={product.id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}>
                    <img src={product.image_url || '/placeholder.png'} style={{ width: '100%', height: '220px', objectFit: 'cover' }} alt={product.name} />
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatPrice(product.price)}</div>
                      <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>{product.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileTabBar activeTab="me" />
    </div>
  );
}

export default CustomerProfile;
