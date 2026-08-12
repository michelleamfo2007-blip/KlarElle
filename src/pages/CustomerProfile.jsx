import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings, ScanLine, Ticket, Coins, Wallet, Gift, 
  CreditCard, Package, Truck, MessageSquare, Undo2, 
  HeadphonesIcon, CalendarCheck, ShieldCheck, ChevronRight 
} from 'lucide-react';
import MobileTabBar from '../components/MobileTabBar';

function CustomerProfile() {
  const { session, signOut } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '70px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Header Profile Section */}
      <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
            {session?.user?.email ? session.user.email[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
              {session?.user?.email ? session.user.email.split('@')[0] : 'Guest'}
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
      <div style={{ background: '#fff', padding: '16px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <Link to="/profile/vouchers" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>4<span style={{ color: 'red', fontSize: '20px', lineHeight: '0', position: 'relative', top: '-4px' }}>.</span></div>
          <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            Vouchers
          </div>
        </Link>
        <Link to="/profile/points" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>100</div>
          <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            Points
          </div>
        </Link>
        <Link to="/profile/wallet" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}><Wallet size={20} strokeWidth={1.5} /></div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Wallet</div>
        </Link>
        <Link to="/profile/gift-cards" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}><Gift size={20} strokeWidth={1.5} /></div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Gift Card</div>
        </Link>
      </div>

      {/* Promo Banner */}
      <div style={{ background: '#fff', padding: '12px 16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ color: '#ff4444', fontWeight: 'bold' }}>
          🎟️ 45% OFF coupon expiring soon
        </div>
        <button style={{ background: '#f5f5f5', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
          Use <span style={{ fontWeight: 'normal' }}>23:59:42</span>
        </button>
      </div>

      {/* My Orders */}
      <div style={{ background: '#fff', padding: '16px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>My Orders</h3>
          <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center' }}>View all <ChevronRight size={14} /></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={24} strokeWidth={1.5} />
            <span style={{ fontSize: '12px' }}>Unpaid</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Package size={24} strokeWidth={1.5} />
            <span style={{ fontSize: '12px' }}>Processing</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <Truck size={24} strokeWidth={1.5} />
            <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>1</div>
            <span style={{ fontSize: '12px' }}>Shipped</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <MessageSquare size={24} strokeWidth={1.5} />
            <div style={{ position: 'absolute', top: '-4px', right: '12px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', fontSize: '10px', padding: '0 4px', fontWeight: 'bold' }}>1</div>
            <span style={{ fontSize: '12px' }}>Review</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Undo2 size={24} strokeWidth={1.5} />
            <span style={{ fontSize: '12px' }}>Returns</span>
          </div>
        </div>
      </div>

      {/* Utilities */}
      <div style={{ background: '#fff', padding: '16px', marginBottom: '8px', display: 'flex', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <HeadphonesIcon size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Customer<br/>Service</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CalendarCheck size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Check In</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>Policy</span>
        </div>
      </div>

      {/* Wishlist Preview */}
      <div style={{ background: '#fff', padding: '16px', marginBottom: '8px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Wishlist</h3>
        {favorites.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {favorites.map(item => (
              <div key={item.id} style={{ minWidth: '100px', width: '100px' }}>
                <img src={item.image_url || '/placeholder.png'} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '4px' }} alt={item.name} />
                <div style={{ fontSize: '12px', color: '#ff4444', fontWeight: 'bold', marginTop: '4px' }}>₵{item.price}</div>
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
          {/* Mock Recommended Items */}
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '220px', objectFit: 'cover' }} alt="Bag" />
            <div style={{ padding: '8px' }}>
              <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '14px' }}>Save ₵5.43</div>
              <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>Women's Retro Faux Leather Bag</div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400" style={{ width: '100%', height: '220px', objectFit: 'cover' }} alt="Pants" />
            <div style={{ padding: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>₵125.00</div>
              <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>Women's Loose Fit Drawstring Pants</div>
            </div>
          </div>
        </div>
      </div>

      <MobileTabBar activeTab="me" />
    </div>
  );
}

export default CustomerProfile;
